// Name: Dev Mode

import '@johnlindquist/kit'

const DEV_DIR = 'Development'

const WindowAlignments = {
  EDITOR: {
    workArea: (screen) => ({
      x: screen.workArea.x,
      y: screen.workArea.y,
      width: (screen.workArea.width / 5) * 3,
      height: screen.workArea.height,
    }),
  },
  TERMINAL: {
    workArea: (screen) => ({
      x: screen.workArea.x + (screen.workArea.width / 5) * 3,
      y: screen.workArea.y,
      width: (screen.workArea.width / 5) * 2,
      height: screen.workArea.height,
    }),
  },
}

async function getActiveAppsFrontMostWindowsPosition() {
  let positionStr = await applescript(String.raw`
        tell application "System Events"
            set processName to name of first application process whose frontmost is true as text
            tell process processName to get position of window 1
        end tell
    `)
  let positionArray = positionStr.split(',').map((str) => parseInt(str.trim()))
  return {
    x: positionArray[0],
    y: positionArray[1],
  }
}

async function getFrontWindowsScreen() {
  let position = await getActiveAppsFrontMostWindowsPosition()
  let screens = await getScreens()
  return screens.find((screen) => {
    return (
      position.x >= screen.bounds.x &&
      position.x <= screen.bounds.x + screen.bounds.width &&
      position.y >= screen.bounds.y &&
      position.y <= screen.bounds.y + screen.bounds.height
    )
  })
}

async function setActiveWindow(windowAlignment) {
  const activeScreen = await getFrontWindowsScreen()
  const workArea = windowAlignment.workArea(activeScreen)
  await setActiveAppPosition({
    x: workArea.x,
    y: workArea.y,
  })
  await setActiveAppSize({
    width: workArea.width,
    height: workArea.height,
  })
}

// Select Project
const dirs = await readdir(home(DEV_DIR))
const selectedDir = await arg(
  'Open Project:',
  dirs.map((dir) => ({
    name: dir,
    description: home(DEV_DIR, dir),
    value: home(DEV_DIR, dir),
  }))
)

// Open VSCode
await edit(selectedDir)
await setActiveWindow(WindowAlignments.EDITOR)

// Open ITerm
await applescript(String.raw`
    tell application "iterm"
      activate
      tell current tab of current window
        select
      end tell
      tell current window
        create tab with default profile  
      end tell
      tell current session of current window
        write text "cd ${selectedDir}"
      end tell
    end tell
`)
await setActiveWindow(WindowAlignments.TERMINAL)
