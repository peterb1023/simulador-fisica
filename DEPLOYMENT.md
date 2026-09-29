# Despliegue local con Apache 2.4

Copiar la aplicación bajo `C:/xampp/htdocs/simulador_fisica` y abrir `http://localhost/simulador_fisica/`. PHP mínimo 7.3 por `JSON_THROW_ON_ERROR`; para un despliegue nuevo usar la versión de PHP mantenida que corresponda a la instalación. No se requiere MySQL ni autenticación.

`.htaccess` deshabilita listados, bloquea acceso HTTP a `.git` y `.claude` cuando mod_rewrite está activo y añade `nosniff`, política de referrer y framing al mismo origen con mod_headers. Comprobar ambos módulos y AllowOverride en el directorio. No se modifica la configuración global de XAMPP. Para una distribución, exportar con `git archive`; no publicar el checkout con `.git`.

Verificación tras instalar en Apache: solicitar una página y revisar los tres headers; solicitar un directorio sin index y comprobar 403; solicitar `.git/config` y `.claude/settings.local.json` y comprobar 403. El servidor integrado `php -S` no interpreta `.htaccess`: se usa únicamente para pruebas en 127.0.0.1.

No se impone CSP: existen scripts, estilos y handlers inline en los simuladores y extras. Una CSP restrictiva exige migrarlos y probarlos; no se añade una política permisiva como falsa garantía.

Google Fonts es opcional: se conservan las familias Syne y Space Mono, con fallback sans-serif/monospace. Sin Internet la física y controles siguen funcionando; cambia la tipografía. Se pueden eliminar las referencias a fonts.googleapis.com para una distribución completamente offline.

XAMPP aquí es un entorno local. La configuración incluida no convierte esa instalación en un servicio público endurecido.
