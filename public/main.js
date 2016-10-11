const outputEl = document.getElementById('out')

function keyCall(key, args) {
  return function(obj) {
    return obj[key].call(obj, args || [])
  }
}

function getTasks() {
  return fetch('/api/tasks')
    .then(keyCall('json'))
}

function main() {
  getTasks()
    .then(function(tasks) {
      const container = document.getElementById('container')
      Object.getOwnPropertyNames(tasks).forEach(function(id) {
        const task = tasks[id]
        const button = document.createElement('button')
        button.appendChild(document.createTextNode(task.name))
        button.addEventListener('click', taskClickHandler(id, task))
        container.appendChild(button)
      })
    })
    .catch(function(e) {
      console.error(e)
    })
}

function taskClickHandler(id, task) {
  return function() {
    console.log(`${task.name} (${id})`)

    const url = 'ws://' + location.origin.match(/\/\/(.*)/)[1] + '/' + id
    const ws = new WebSocket(url)
    ws.addEventListener('message', function(event) {
      let str = event.data

      // Remove colors.. D:
      str = str.replace(/\[[0-9;]*m/g, '')

      outputEl.value += str

      outputEl.scrollTop = outputEl.scrollHeight
    })

    fetch('/api/run-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: id
      })
    }).catch(function(e) {
      console.error(e)
    })
  }
}

main()
