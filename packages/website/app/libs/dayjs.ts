import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";

import "dayjs/locale/de";
import "dayjs/locale/en";

dayjs.extend(calendar);

export default dayjs;
