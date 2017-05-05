exports.toPromise = func => (...args) =>
  new Promise((accept, reject) =>
    func(...args, (error, data) => (error ? reject(error) : accept(data)))
  );

exports.catchAsyncErrors = asyncFunction => (...args) => asyncFunction(...args).catch(args[2]);
