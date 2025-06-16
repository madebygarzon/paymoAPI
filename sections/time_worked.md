# Time Worked por Proyecto

Esta guía explica cómo obtener las horas registradas para un proyecto mediante la API de Paymo.

## 1. Endpoint

Realiza una petición **POST** a `https://app.paymoapp.com/api/reports`.

## 2. Autenticación

Utiliza **Basic Auth** con tu API key (o correo) como nombre de usuario y la contraseña vacía (o tu contraseña de Paymo).

## 3. Encabezados

```
Accept: application/json
Content-Type: application/json
```

## 4. Cuerpo de la solicitud

Envía un objeto JSON similar al siguiente. Reemplaza `3323471` con el ID de tu proyecto.

```json
{
  "type": "temp",
  "projects": [3323471],
  "users": "all",
  "date_interval": "all_time",
  "include": { "projects": true }
}
```

## 5. Leer el resultado

La respuesta contendrá un arreglo `reports`. Accede a `reports[0].content.items` y busca el objeto cuyo `type` sea `"total"`. El campo `time` de ese objeto representa los segundos trabajados en total para el proyecto.

En el caso del proyecto con ID `3323471`, el valor recibido es `2681075` segundos, que corresponden a **744h 44m** de trabajo.

Un fragmento de la respuesta luce así:

```json
{
  "reports": [
    {
      "content": {
        "items": [
          { "type": "project", "time": 2681075, "title": "Mi Proyecto" },
          { "type": "total", "time": 2681075, "pct": 100 }
        ]
      }
    }
  ]
}
```

Puedes convertir ese valor a horas y minutos con el siguiente código de ejemplo:

```javascript
const horas = Math.floor(time / 3600);
const minutos = Math.floor((time % 3600) / 60);
const resultado = `${horas}h ${minutos}m`;
// Con el valor de ejemplo, imprime:
// "744h 44m"
```

Este tiempo coincide con la columna **Time Worked** que aparece en la pantalla de **Performance** de esta interfaz.

Si la petición al endpoint de *reports* falla o devuelve `0` segundos, la aplicación toma el valor del campo `recorded_time` obtenido al consultar el proyecto con `/projects/{id}`.
