const test = (arg1, arg2, arg3) => {
  console.log("arg1:", arg1);
  console.log("arg2:", arg2);
  console.log("arg3:", arg3);
}



test.apply(this, ['1', '2', '3'])
