```
const items = service('demo_service')
    .filter(data => data.data.deliver_to === 'London')
    .map(data => data.data.items.length);

const total_items = items.reduce((a, b) => a + 1, 0);

items.reduce((a, b) => a + b).map(v => v / total_items.get())
```