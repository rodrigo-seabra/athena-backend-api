export interface ScheduleInterface {
    classId: string;
    scheduleItems: {
      dayOfWeek: number; // 1 para segunda-feira, 2 para terça-feira, até 5 (sexta-feira)
      startTime: string; // Horário de início no formato "HH:mm"
      endTime: string; // Horário de término no formato "HH:mm"
      topic: string;
      resources?: string[]; // Links ou referências para materiais de estudo, opcionais
    }[];
  }
  