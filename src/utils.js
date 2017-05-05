const callback = (accept, reject) =>
  function (error, data) {
    if (arguments.length === 0) {
      accept();
    } else if (error) {
      reject(error);
    } else {
      accept(data);
    }
  };

exports.toPromise = func => (...args) =>
  new Promise((accept, reject) => func(...args, callback(accept, reject)));

exports.catchAsyncErrors = asyncFunction => (...args) => asyncFunction(...args).catch(args[2]);
