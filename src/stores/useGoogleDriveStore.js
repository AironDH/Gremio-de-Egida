import { defineStore } from 'pinia'

// Mantenemos el tokenClient fuera del estado reactivo porque es un objeto de Google
let tokenClient = null;

export const useGoogleDriveStore = defineStore('googleDrive', {
  state: () => ({
    token: null,
    usuarioAutenticado: false,
    inicializado: false
  }),

  actions: {
    async inicializarGoogle() {
      // Evitar inicializar múltiples veces
      if (this.inicializado) return;

      // Lectura segura de la variable de entorno
      const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
      const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

      if (!CLIENT_ID) {
        console.error('Error crítico: VITE_GOOGLE_CLIENT_ID no está definido en el archivo .env');
        return;
      }

      // 1. Promesa para inicializar GAPI (Google API Client)
      const cargarGapi = new Promise((resolve) => {
        const initGapi = () => {
          window.gapi.load('client', async () => {
            await window.gapi.client.init({
              discoveryDocs: [DISCOVERY_DOC],
            });
            resolve();
          });
        };

        if (window.gapi) {
          initGapi();
        } else {
          // Si el script aún está descargando, comprobamos periódicamente
          const intervalo = setInterval(() => {
            if (window.gapi) {
              clearInterval(intervalo);
              initGapi();
            }
          }, 100);
        }
      });

      // 2. Promesa para inicializar GIS (Google Identity Services)
      const cargarGis = new Promise((resolve) => {
        const initTokenClient = () => {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse) => {
              if (tokenResponse.error !== undefined) {
                console.error('Error en autenticación:', tokenResponse.error);
                throw tokenResponse;
              }
              // Guardamos el token y actualizamos el estado
              this.token = tokenResponse.access_token;
              this.usuarioAutenticado = true;
            },
          });
          resolve();
        };

        if (window.google?.accounts?.oauth2) {
          initTokenClient();
        } else {
          // Comprobamos periódicamente si el script ya descargó
          const intervalo = setInterval(() => {
            if (window.google?.accounts?.oauth2) {
              clearInterval(intervalo);
              initTokenClient();
            }
          }, 100);
        }
      });

      // Esperar a que ambos servicios estén listos
      await Promise.all([cargarGapi, cargarGis]);
      this.inicializado = true;
    },

    iniciarSesion() {
      if (!this.inicializado || !tokenClient) {
        console.warn('Los servicios de Google aún no se han inicializado.');
        return;
      }
      
      // Abre la ventana emergente de Google para conceder permisos. 
      // Se recomienda forzar el prompt para garantizar que los permisos se otorguen correctamente.
      tokenClient.requestAccessToken({ prompt: 'consent' });
    },

    cerrarSesion() {
      if (this.token && window.google) {
        window.google.accounts.oauth2.revoke(this.token, () => {
          this.token = null;
          this.usuarioAutenticado = false;
        });
      }
    },

    // 1. Función interna para buscar el archivo en la carpeta oculta appDataFolder
    async _buscarArchivoBackup() {
      try {
        const respuesta = await window.gapi.client.drive.files.list({
          spaces: 'appDataFolder',
          q: "name='gremio_egida_backup.json'",
          fields: 'files(id, name)'
        });
        const archivos = respuesta.result.files;
        return archivos && archivos.length > 0 ? archivos[0].id : null;
      } catch (error) {
        console.error('Error al buscar el archivo en Google Drive:', error);
        throw error;
      }
    },

    // 2. Acción para guardar en la nube (Crear o Actualizar)
    async guardarEnNube(datosJson) {
      if (!this.usuarioAutenticado) throw new Error('Usuario no autenticado en Google.');

      try {
        const fileId = await this._buscarArchivoBackup();
        
        // Preparación del cuerpo multipart para la API de Google
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const metadata = {
          name: 'gremio_egida_backup.json',
          mimeType: 'application/json'
        };

        // Si es un archivo nuevo, le asignamos la carpeta appDataFolder.
        // Si ya existe (PATCH), la API de Google no permite enviar el atributo 'parents'.
        if (!fileId) {
          metadata.parents = ['appDataFolder'];
        }

        const multipartRequestBody =
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(datosJson) +
          close_delim;

        // Definimos la ruta y el método HTTP dependiendo de si existe el archivo
        const path = fileId ? `/upload/drive/v3/files/${fileId}` : '/upload/drive/v3/files';
        const method = fileId ? 'PATCH' : 'POST';

        // Ejecutamos la petición REST a través del cliente GAPI
        await window.gapi.client.request({
          path: path,
          method: method,
          params: { uploadType: 'multipart' },
          headers: {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
          },
          body: multipartRequestBody
        });

        return true;
      } catch (error) {
        console.error('Error crítico al guardar en la nube:', error);
        throw error;
      }
    },

    // 3. Acción para descargar y parsear el archivo desde la nube
    async cargarDesdeNube() {
      if (!this.usuarioAutenticado) throw new Error('Usuario no autenticado en Google.');

      try {
        const fileId = await this._buscarArchivoBackup();
        
        if (!fileId) {
          throw new Error('No se encontró ningún archivo de respaldo en tu nube de Google Drive.');
        }

        const respuesta = await window.gapi.client.drive.files.get({
          fileId: fileId,
          alt: 'media' // 'media' obliga a Google a devolver el contenido del archivo, no sus metadatos
        });

        // GAPI puede devolver el contenido de distintas formas dependiendo del navegador.
        // Nos aseguramos de extraer y parsear el JSON de forma segura.
        let contenido;
        if (respuesta.body) {
          contenido = JSON.parse(respuesta.body);
        } else {
          contenido = typeof respuesta.result === 'string' ? JSON.parse(respuesta.result) : respuesta.result;
        }
        
        return contenido;
      } catch (error) {
        console.error('Error al cargar datos desde la nube:', error);
        throw error;
      }
    }
  }
})

