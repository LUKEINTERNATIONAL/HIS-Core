function convertArrayToTurples(items: Array<any>, size=2) {
    return items.reduce((acc, _, i) => {
      if (i % size === 0) acc.push(items.slice(i, i + size))
      return acc
    }, [])
}

function orderObj(unordered: any) {
  return Object.keys(unordered).sort().reduce(
    (obj: any, key: any) => { 
        obj[key] = unordered[key]; 
        return obj;
    }, 
    {}
  )
}

export default {
  convertArrayToTurples,
  orderObj
}