import * as Battery from 'expo-battery';
import * as Brightness from 'expo-brightness';
import browserTools from './browserTools';

const get_battery_level = async () => {
  const batteryLevel = await Battery.getBatteryLevelAsync();
  console.log('batteryLevel', batteryLevel);
  if (batteryLevel === -1) {
    return 'Error: Device does not support retrieving the battery level.';
  }
  return batteryLevel;
};

const change_brightness = ({ brightness }: { brightness: number }) => {
  console.log('change_brightness', brightness);
  Brightness.setSystemBrightnessAsync(brightness);
  return brightness;
};

const flash_screen = () => {
  Brightness.setSystemBrightnessAsync(1);
  setTimeout(() => {
    Brightness.setSystemBrightnessAsync(0);
  }, 200);
  return 'Successfully flashed the screen.';
};

// Web browser interaction tools
const open_new_tab = (url: string) => {
  return browserTools.openNewTab(url);
};

const click_element = (selector: string) => {
  return browserTools.clickElement(selector);
};

const type_text = ({ selector, text }: { selector: string; text: string }) => {
  return browserTools.typeText({ selector, text });
};

const get_current_url = () => {
  return browserTools.getCurrentUrl();
};

const scroll_to = ({ x, y }: { x: number; y: number }) => {
  return browserTools.scrollTo({ x, y });
};

const get_element_text = (selector: string) => {
  return browserTools.getElementText(selector);
};

const tools = {
  get_battery_level,
  change_brightness,
  flash_screen,
  // Browser tools
  open_new_tab,
  click_element,
  type_text,
  get_current_url,
  scroll_to,
  get_element_text,
};

export default tools;