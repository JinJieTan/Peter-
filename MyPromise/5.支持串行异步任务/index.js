const Mypromise = require('./mypromise');

new Mypromise((resolve, reject) => {
  resolve(1);
})
  .then((value, err) => {
    return 2;
  })
  .then((value, err) => {
    return 3;
  });
