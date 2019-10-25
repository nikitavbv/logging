```
service('demo_service')
```

```
service('demo_service')
   .filter(row => row.tag === 'info')
   .map(row => row.data)
```

```
service('demo_service')
   .filter(row => row.tag === 'info')
   .map(row => row.data)
   .map(row => row.items.map(item => item.price))
```

```
service('demo_service')
   .filter(row => row.tag === 'info')
   .map(row => row.data)
   .map(row => row.items.map(item => item.price).reduce((a, b) => a + b))
```

```
service('demo_service')
   .filter(row => row.tag === 'info')
   .map(row => row.data)
   .map(row => row.items.map(item => item.price).reduce((a, b) => a + b))
   .reduce((a, b) => a + b)
```

```
service('demo_service')
  .filter(row => row.tag === 'error')
  .map(row => row.data.message)
  .reduce((a, b) => { a[b] = (a[b] || 0) + 1; return a }, {})
  .map(v => Object.keys(v).map(k => ({ 'error': k, 'total': v[k] })));
```

```
const items = service('demo_service')
    .filter(row => row.tag === 'info')
    .filter(row => row.data.deliver_to === 'London')
    .map(data => data.data.items.length);

const total_items = items.reduce((a, b) => a + 1, 0);

items.reduce((a, b) => a + b).map(v => v / total_items.get())
```