# Carta de aniversario — proyecto local

## Archivos

- `index.html`: contenido y estructura de la carta.
- `styles.css`: estilos, paleta mantequilla/dorada y adaptación a móviles.
- `script.js`: galería automática, reproductor, sorpresa y contador.
- `fotos/`: aquí van las 49 imágenes.
- `audio/`: aquí va el archivo de música.

## Cómo nombrar las fotos

Copia las fotos en `fotos/` usando nombres como:

- `foto-01.jpg`
- `foto-02.jpg`
- ...
- `foto-49.jpg`

El código primero busca `.jpg` y, si no lo encuentra, intenta `.jpeg`. Por eso admite ambas extensiones, siempre que mantengas el mismo nombre base y la numeración con dos dígitos (`foto-01`, `foto-02`, etc.). Las mayúsculas en la extensión es preferible evitarlas.

## Cómo nombrar la canción

Guarda el archivo de audio como `audio/nuestra-cancion.mp3`. La página lo carga desde esa ruta; no es necesario seleccionar el archivo con un botón. El navegador normalmente exige que el visitante toque el botón de reproducción para permitir que empiece el audio.

## Ver en localhost

1. Abre esta carpeta en Visual Studio Code.
2. Abre una terminal dentro de la carpeta y ejecuta:

   ```powershell
   py -m http.server 5500
   ```

3. Abre `http://localhost:5500` en el navegador.
4. Cuando edites y guardes un archivo, recarga la página.
5. Para detener el servidor, usa `Ctrl+C`.

Si `py` no está disponible, prueba `python -m http.server 5500`.

## Nota sobre los archivos multimedia

El ZIP incluye el código y carpetas listas, pero no incluye tus fotos ni tu canción originales. Copia tus archivos a las carpetas indicadas. La galería prueba automáticamente `foto-01.jpg` hasta `foto-49.jpg` y usa `.jpeg` como alternativa por cada foto.
