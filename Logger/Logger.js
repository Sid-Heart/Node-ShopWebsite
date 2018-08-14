module.exports = {
  log: (msz,obj) => {
    console.log(new Date() + " - " + msz)
    if (obj) console.log(obj)
  }
}