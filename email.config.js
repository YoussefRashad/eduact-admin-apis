module.exports = {
  //Prefix to wrap named variables in html files
  prefix: '%%',
  //Html Files to include with an array of available variables
  files: {
    'approved-en': ['name', 'classroom_name', 'classroom_url'],
    'approved-ar': ['name', 'classroom_name', 'classroom_url'],
    'denied-en': ['name', 'classroom_name', 'instructor_name', 'classroom_url'],
    'denied-ar': ['name', 'classroom_name', 'instructor_name', 'classroom_url'],
  },
}
