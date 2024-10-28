// src/utils/calculateAttendedClasses.ts

import { ScheduleInterface } from "../interfaces/Schedule.interface";

export function calculateAttendedClasses(
  entryTime: Date,
  exitTime: Date,
  schedule: ScheduleInterface
): number {
  let attendedClasses = 0;

  schedule.scheduleItems.forEach((item) => {
    const [startHour, startMinute] = item.startTime.split(":").map(Number);
    const [endHour, endMinute] = item.endTime.split(":").map(Number);

    const classStartTime = new Date(entryTime);
    classStartTime.setHours(startHour, startMinute, 0);

    const classEndTime = new Date(exitTime);
    classEndTime.setHours(endHour, endMinute, 0);

    // Verifica se o aluno estava presente durante o horário da aula
    if (
      entryTime.getTime() <= classEndTime.getTime() &&
      exitTime.getTime() >= classStartTime.getTime()
    ) {
      attendedClasses++;
    }
  });

  return attendedClasses;
}
