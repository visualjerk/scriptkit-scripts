// Name: Open Projects

import '@johnlindquist/kit'

const dirs = await readdir(home('Development'))

const selectedDir = await arg(
  'Open Project:',
  dirs.map((dir) => ({
    name: dir,
    description: home('Development', dir),
    value: home('Development', dir),
  }))
)

edit(selectedDir)
