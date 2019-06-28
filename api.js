import ndjsonStream from "can-ndjson-stream";

function get(onEvent) {
  // Retrieve NDJSON from the server
  fetch("http://localhost:8080/events")
    .then(response => ndjsonStream(response.body))
    .then(stream => {
      const reader = stream.getReader();
      let read;
      reader.read().then(
        (read = result => {
          if (result.done) {
            return;
          }
          onEvent(result.value);
          reader.read().then(read);
        })
      );
    })
    .catch(err => console.error(err));
}

export default get;
