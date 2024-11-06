import mongoose from "mongoose";
import School from "./School";
import User from "./User";
import Class from "./Class";
import Task from "./Task";
import StudentStats from "./StudentStats"; // Certifique-se de importar o modelo StudentStats
import "dotenv/config";
import bcrypt from "bcrypt";
import Schedule from "./Schedule";
import Attendance from "./Attendance";


const mongoURI =
  process.env.CONNECTIONSTRING || "mongodb://localhost:27017/Athena";

async function createUser(userData: any) {
  const salt = await bcrypt.genSalt(10);
  userData.password = await bcrypt.hash(userData.password, salt);
  return User.create(userData);
}

async function createSchool(schoolData: any) {
  const salt = await bcrypt.genSalt(10);
  schoolData.password = await bcrypt.hash(schoolData.password, salt);
  return School.create(schoolData);
}

async function createStudentStats(userId: string, subjects: any[]) {
  const existingStats = await StudentStats.findOne({ userId });

  if (existingStats) {
    throw new Error(`Estatísticas já existem para o usuário com ID ${userId}.`);
  }

  const initialStats = subjects.map((subject: any) => ({
    name: subject,
    averageLevel: Math.max(1, Math.floor(Math.random() * 5)),
    activitiesCount: Math.floor(Math.random() * 10),
  }));
  const teste = subjects.map((subject: any) => ({
    name: subject,
    averageLevel: Math.max(1, Math.floor(Math.random() * 5)),
    activitiesCount: Math.floor(Math.random() * 10),
  }));


  const currentStats = await StudentStats.create({
    userId,
    subjects: teste,
    createdAt: new Date(),
    pastStat: [
      {
        semester: "Semestre Atual",
        subjects: initialStats,
      },
    ],
  });

  return currentStats;
}
async function createSchedule(classId: string) {
  const scheduleItems = [
    { dayOfWeek: "1", startTime: "08:00", endTime: "09:30", topic: "Matemática" },
    { dayOfWeek: "1", startTime: "09:30", endTime: "11:00", topic: "Educação Física" },
    { dayOfWeek: "1", startTime: "11:00", endTime: "12:30", topic: "Português" },
    { dayOfWeek: "1", startTime: "13:00", endTime: "14:30", topic: "Inglês" },
    { dayOfWeek: "1", startTime: "14:30", endTime: "16:00", topic: "História" },
    { dayOfWeek: "1", startTime: "16:00", endTime: "17:30", topic: "Filosofia" },

    { dayOfWeek: "2", startTime: "08:00", endTime: "09:30", topic: "Matemática" },
    { dayOfWeek: "2", startTime: "09:30", endTime: "11:00", topic: "Educação Física" },
    { dayOfWeek: "2", startTime: "11:00", endTime: "12:30", topic: "Português" },
    { dayOfWeek: "2", startTime: "13:00", endTime: "14:30", topic: "Inglês" },
    { dayOfWeek: "2", startTime: "14:30", endTime: "16:00", topic: "História" },
    { dayOfWeek: "2", startTime: "16:00", endTime: "17:30", topic: "Filosofia" },

    { dayOfWeek: "3", startTime: "08:00", endTime: "09:30", topic: "Matemática" },
    { dayOfWeek: "3", startTime: "09:30", endTime: "11:00", topic: "Educação Física" },
    { dayOfWeek: "3", startTime: "11:00", endTime: "12:30", topic: "Português" },
    { dayOfWeek: "3", startTime: "13:00", endTime: "14:30", topic: "Inglês" },
    { dayOfWeek: "3", startTime: "14:30", endTime: "16:00", topic: "História" },
    { dayOfWeek: "3", startTime: "16:00", endTime: "17:30", topic: "Filosofia" },

    { dayOfWeek: "4", startTime: "08:00", endTime: "09:30", topic: "Matemática" },
    { dayOfWeek: "4", startTime: "09:30", endTime: "11:00", topic: "Educação Física" },
    { dayOfWeek: "4", startTime: "11:00", endTime: "12:30", topic: "Português" },
    { dayOfWeek: "4", startTime: "13:00", endTime: "14:30", topic: "Inglês" },
    { dayOfWeek: "4", startTime: "14:30", endTime: "16:00", topic: "História" },
    { dayOfWeek: "4", startTime: "16:00", endTime: "17:30", topic: "Filosofia" },

    { dayOfWeek: "5", startTime: "08:00", endTime: "09:30", topic: "Matemática" },
    { dayOfWeek: "5", startTime: "09:30", endTime: "11:00", topic: "Educação Física" },
    { dayOfWeek: "5", startTime: "11:00", endTime: "12:30", topic: "Português" },
    { dayOfWeek: "5", startTime: "13:00", endTime: "14:30", topic: "Inglês" },
    { dayOfWeek: "5", startTime: "14:30", endTime: "16:00", topic: "História" },
    { dayOfWeek: "5", startTime: "16:00", endTime: "17:30", topic: "Filosofia" },
  ];

  return Schedule.create({ classId, scheduleItems });
}

async function createAttendance(studentId: string, classId: string) {
  const currentDate = new Date();
  const attendanceRecords = [];
  const totalClasses = 6;  // Número fixo de aulas por dia
  const minimumAttendance = Math.floor(totalClasses); // Total de aulas a serem registradas

  for (let i = 0; i < 15; i++) {
    const randomDaysBack = Math.floor(Math.random() * 30);
    const randomDate = new Date(currentDate);
    randomDate.setDate(currentDate.getDate() - randomDaysBack);

    let attendedClasses = 0;

    // A probabilidade de presença de 4 a 6 aulas
    const presenceOptions = [4, 5, 6]; // 4, 5 ou 6 aulas frequentadas

    // Escolher aleatoriamente o número de aulas que o aluno vai frequentar
    attendedClasses = presenceOptions[Math.floor(Math.random() * presenceOptions.length)];

    const presentClasses = new Set();

    // Gerar aulas aleatórias em que o aluno compareceu, com o número de aulas frequentes
    while (presentClasses.size < attendedClasses) {
      presentClasses.add(Math.floor(Math.random() * totalClasses)); // Aulas aleatórias
    }

    const attendanceTimes = [
      { hour: 8, minute: 0, note: "Presença na primeira aula" },   // 1ª aula (08:00-09:30)
      { hour: 9, minute: 30, note: "Presença na segunda aula" },   // 2ª aula (09:30-11:00)
      { hour: 11, minute: 0, note: "Presença na terceira aula" },  // 3ª aula (11:00-12:30)
      { hour: 13, minute: 0, note: "Presença na quarta aula" },    // 4ª aula (13:00-14:30)
      { hour: 14, minute: 30, note: "Presença na quinta aula" },   // 5ª aula (14:30-16:00)
      { hour: 16, minute: 0, note: "Presença na sexta aula" },     // 6ª aula (16:00-17:30)
    ];

    // Registro de presença diário, com entrada na primeira aula e saída na última
    const entryTime = new Date(randomDate.setHours(8, 0, 0));  // Entrada na primeira aula (08:00)
    const exitTime = new Date(randomDate.setHours(17, 30, 0)); // Saída na última aula (17:30)

    attendanceRecords.push({
      studentId,
      classId,
      date: randomDate,  // A data do registro será o dia em questão
      entryTime,         // Entrada no horário da primeira aula
      exitTime,          // Saída no horário da última aula
      attendedClasses,   // Quantidade de aulas que o aluno participou
      totalClasses,      // Total de aulas (6)
      attempts: Math.floor(Math.random() * 3),  // Tentativas aleatórias
      recognitionCode: attendedClasses > 0 ? "success" : "absent",  // Se o aluno participou, marca como 'success', caso contrário 'absent'
      notes: attendedClasses > 0 ? `${attendedClasses} aulas presentes` : "Falta registrada automaticamente",
    });
  }

  return Attendance.insertMany(attendanceRecords);
}





async function seedDatabase() {
  await mongoose.connect(mongoURI);

  try {
    // Criar escola
    const school = await createSchool({
      name: "Escola Sicredi Inovação",
      email: "contato1@escolaexemplo.com",
      phone: "987654321",
      cnpj: "12345678200195",
      address: {
        street: "Rua Exemplo 1",
        cep: "12345-679",
        state: "SP",
        city: "São Paulo",
      },
      password: "senhaSegura",
      status: true,
    });

    console.log("Escola criada:", school);

    const teachers = await Promise.all([
      createUser({
        name: "Professor Sicredi 1",
        email: "professor1@escolaexemplo.com",
        phone: "987654321",
        password: "senhaSegura",
        role: "professor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Professor 1",
          cep: "12345-678",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "12345678900",
      }),
      createUser({
        name: "Professor Sicredi 2",
        email: "professor2@escolaexemplo.com",
        phone: "987654321",
        password: "senhaSegura",
        role: "professor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Professor 2",
          cep: "12345-678",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "12345678900",
      }),
      createUser({
        name: "Professor Sicredi",
        email: "professor3@escolaexemplo.com",
        phone: "987654321",
        password: "senhaSegura",
        role: "professor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Professor 3",
          cep: "12345-678",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "12345678900",
      }),
      createUser({
        name: "Professor Sicredi 4",
        email: "professor4@escolaexemplo.com",
        phone: "987654322",
        password: "senhaSegura",
        role: "professor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Professor 4",
          cep: "12345-679",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "12345678901",
      }),
      createUser({
        name: "Professor Sicredi 5",
        email: "professor5@escolaexemplo.com",
        phone: "987654323",
        password: "senhaSegura",
        role: "professor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Professor 5",
          cep: "12345-680",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "12345678902",
      }),
      createUser({
        name: "Professor Sicredi 6",
        email: "professor6@escolaexemplo.com",
        phone: "987654324",
        password: "senhaSegura",
        role: "professor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Professor 6",
          cep: "12345-681",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "12345678903",
      }),
    ]);

    console.log("Usuários (professores) criados:", teachers);


    const users = [
      {
        name: "Diretor Sicredi",
        email: "diretor@escolaexemplo.com",
        phone: "123456789",
        password: "senhaSegura",
        role: "diretor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Diretor",
          cep: "12345-678",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "11122233344",
      },
      {
        name: "Coordenador Sicredi",
        email: "coordenador@escolaexemplo.com",
        phone: "123456780",
        password: "senhaSegura",
        role: "coordenador",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Coordenador",
          cep: "12345-679",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "11122233345",
      },
      {
        name: "Inspetor Sicredi",
        email: "inspetor@escolaexemplo.com",
        phone: "123456781",
        password: "senhaSegura",
        role: "inspetor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Inspetor",
          cep: "12345-680",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "11122233346",
      },
      {
        name: "Funcionário Limpeza",
        email: "limpeza@escolaexemplo.com",
        phone: "123456782",
        password: "senhaSegura",
        role: "limpeza",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Limpeza",
          cep: "12345-681",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "11122233347",
      },
      {
        name: "Funcionário Cozinha",
        email: "cozinha@escolaexemplo.com",
        phone: "123456783",
        password: "senhaSegura",
        role: "cozinha",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua da Cozinha",
          cep: "12345-682",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "11122233348",
      },
      {
        name: "Outro Funcionário",
        email: "outro@escolaexemplo.com",
        phone: "123456784",
        password: "senhaSegura",
        role: "outro",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Outro",
          cep: "12345-683",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "11122233349",
      },
    ];

    // Criação de usuários de outros papéis no banco de dados
    const otherRolesUsers = await Promise.all(users.map(userData => createUser(userData)));
    console.log("Usuários de outros papéis criados:", otherRolesUsers);


    const students = [
      {
        name: "Aluno Sicredi 1",
        email: "aluno1@escolaexemplo.com",
        phone: "123123123",
        cpf: "98765432100",
        address: {
          street: "Rua do Aluno 1",
          cep: "98765-432",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 2",
        email: "aluno2@escolaexemplo.com",
        phone: "321321321",
        cpf: "12312312300",
        address: {
          street: "Rua do Aluno 2",
          cep: "65432-123",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 3",
        email: "aluno3@escolaexemplo.com",
        phone: "3213213221",
        cpf: "15312312300",
        address: {
          street: "Rua do Aluno 3",
          cep: "65432-133",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 4",
        email: "aluno4@escolaexemplo.com",
        phone: "3213243221",
        cpf: "15312312301",
        address: {
          street: "Rua do Aluno 4",
          cep: "65432-134",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 5",
        email: "aluno5@escolaexemplo.com",
        phone: "3213243222",
        cpf: "15312312302",
        address: {
          street: "Rua do Aluno 5",
          cep: "65432-135",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 6",
        email: "aluno6@escolaexemplo.com",
        phone: "3213243223",
        cpf: "15312312303",
        address: {
          street: "Rua do Aluno 6",
          cep: "65432-136",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 7",
        email: "aluno7@escolaexemplo.com",
        phone: "3213243224",
        cpf: "15312312304",
        address: {
          street: "Rua do Aluno 7",
          cep: "65432-137",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 8",
        email: "aluno8@escolaexemplo.com",
        phone: "3213243225",
        cpf: "15312312305",
        address: {
          street: "Rua do Aluno 8",
          cep: "65432-138",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 9",
        email: "aluno9@escolaexemplo.com",
        phone: "3213243226",
        cpf: "15312312306",
        address: {
          street: "Rua do Aluno 9",
          cep: "65432-139",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 10",
        email: "aluno10@escolaexemplo.com",
        phone: "3213243227",
        cpf: "15312312307",
        address: {
          street: "Rua do Aluno 10",
          cep: "65432-140",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 11",
        email: "aluno11@escolaexemplo.com",
        phone: "3213243228",
        cpf: "15312312308",
        address: {
          street: "Rua do Aluno 11",
          cep: "65432-141",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 12",
        email: "aluno12@escolaexemplo.com",
        phone: "3213243229",
        cpf: "15312312309",
        address: {
          street: "Rua do Aluno 12",
          cep: "65432-142",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 13",
        email: "aluno13@escolaexemplo.com",
        phone: "3213243230",
        cpf: "15312312310",
        address: {
          street: "Rua do Aluno 13",
          cep: "65432-143",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 14",
        email: "aluno14@escolaexemplo.com",
        phone: "3213243231",
        cpf: "15312312311",
        address: {
          street: "Rua do Aluno 14",
          cep: "65432-144",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 15",
        email: "aluno15@escolaexemplo.com",
        phone: "3213243232",
        cpf: "15312312312",
        address: {
          street: "Rua do Aluno 15",
          cep: "65432-145",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Sicredi 16",
        email: "aluno16@escolaexemplo.com",
        phone: "3213243233",
        cpf: "15312312313",
        address: {
          street: "Rua do Aluno 16",
          cep: "65432-146",
          state: "SP",
          city: "São Paulo",
        },
      },
    ];

    // Criar usuários (alunos)
    const createdStudents = await Promise.all(students.map(async studentData => {
      const student = await createUser({
        ...studentData,
        password: "senhaSegura",
        role: "estudante",
        IdSchool: school._id,
        approved: true,
      });

      await createStudentStats(String(student._id), ["Matemática", "História", "Educação Física", "Inglês", "Filosofia", "Português",],
      );
      return student;
    }));

    console.log("Usuários (alunos) criados:", createdStudents);

    // Criar classes
    const classes = [
      {
        name: "Turma 9A",
        grade: "9º Ano",
        teacher: [teachers[0]._id, teachers[1]._id, teachers[2]._id, teachers[3]._id],
        students: [
          createdStudents[0]._id, createdStudents[1]._id, createdStudents[2]._id,
          createdStudents[3]._id, createdStudents[4]._id,
        ],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Educação Física", "Inglês", "Filosofia", "Português",],
      },
      {
        name: "Turma 9B",
        grade: "9º Ano",
        teacher: [teachers[1]._id, teachers[4]._id, teachers[2]._id, teachers[5]._id],
        students: [
          createdStudents[5]._id, createdStudents[6]._id, createdStudents[7]._id,
          createdStudents[8]._id,
        ],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Educação Física", "Inglês", "Filosofia", "Português",],
      },
      {
        name: "Turma 8A",
        grade: "8º Ano",
        teacher: [teachers[0]._id, teachers[2]._id, teachers[5]._id, teachers[4]._id],
        students: [
          createdStudents[10]._id, createdStudents[11]._id, createdStudents[12]._id,
          createdStudents[13]._id,
        ],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Educação Física", "Inglês", "Filosofia", "Português",],
      },
      {
        name: "Turma 8B",
        grade: "8º Ano",
        teacher: [teachers[3]._id, teachers[4]._id, teachers[1]._id, teachers[0]._id],
        students: [
          createdStudents[14]._id, createdStudents[15]._id, createdStudents[9]._id,
        ],
        IdSchool: school._id,
        year: 2024,
        subject: ["Filosofia", "Inglês", "Português", "Matemática", "Educação Física", "História"],
      },
    ];

    const createdClasses = await Class.insertMany(classes);
    console.log("Classes criadas:", createdClasses);

    const schedules = await Promise.all(
      createdClasses.map((createdClass) => createSchedule(String(createdClass._id)))
    );
    console.log("Cronogramas criados para as classes:", schedules);

    await Promise.all(
      createdClasses.map(async (classData) => {
        for (const studentId of classData.students) {
          await createAttendance(String(studentId), String(classData._id));
        }
      })
    );
    console.log("Presença dos alunos criada.");

    // const tasks :  any[] = [];

    // const createTasksForClass = (classId : any, subjects : any) => {
    //   subjects.forEach((subject: any, index : any) => {
    //     for (let i = 1; i <= 8; i++) {
    //       tasks.push({
    //         subject,
    //         content: `${subject} Tarefa ${i} para ${classId}.`,
    //         dueDate: new Date(`2024-11-0${i}`),
    //         recipients: [String(classId)],
    //         IdTeacher: teachers[index]._id, 
    //         IdClass: String(classId),
    //         status: "em andamento",
    //         school: school._id,
    //       });
    //     }
    //   });
    // };

    // // Criar tarefas para cada classe
    // createdClasses.forEach(createdClass => {
    //   createTasksForClass(createdClass._id, createdClass.subject);
    // });

    // const createdTasks = await Task.insertMany(tasks);
    // console.log("Tarefas criadas:", createdTasks);

    const tasks: any = [];

    const createTasksForClass = (classId: any, subjects: any, students: any) => {
      subjects.forEach((subject: string, index: number) => {
          tasks.push({
            subject,
            content: `${subject} Tarefa Concluída e Avaliada  para ${classId}.`,
            dueDate: new Date(`2024-11-05`),
            recipients: [String(classId)],
            IdTeacher: teachers[index]._id,
            IdClass: String(classId),
            status: "pronto",
            school: school._id,
            studentResponses: students.map((student: any) => ({
              studentId: student,
              studentName: `Nome do Aluno ${student}`, 
              responseContent: `Resposta do aluno ${student} para a tarefa de ${subject}`,
              submissionDate: new Date(),
              graded: true,
              grade: Math.floor(Math.random() * 6 + 5), 
              feedback: "Feedback do professor",
            })),
          });

          tasks.push({
            subject,
            content: `${subject} Tarefa Concluída esperando Avaliação teste para ${classId}.`,
            dueDate: new Date(`2024-11-09`),
            recipients: [String(classId)],
            IdTeacher: teachers[index]._id,
            IdClass: String(classId),
            status: "pendente",
            school: school._id,
            studentResponses: students.map((student: any) => ({
              studentId: student,
              studentName: `Nome do Aluno ${student}`,
              responseContent: `Resposta do aluno ${student} para a tarefa de ${subject}`,
              submissionDate: new Date(),
            })),
          });

        // Tarefas em andamento
          tasks.push({
            subject,
            content: `${subject} Tarefa em Andamento teste para ${classId}.`,
            dueDate: new Date(`2024-12-10`),
            recipients: [String(classId)],
            IdTeacher: teachers[index]._id,
            IdClass: String(classId),
            status: "em andamento",
            school: school._id,
          });

          tasks.push({
            subject,
            content: `${subject} Tarefa em Andamento teste para ${classId}.`,
            dueDate: new Date(`2024-11-08`),
            recipients: [String(classId)],
            IdTeacher: teachers[index]._id,
            IdClass: String(classId),
            status: "em andamento",
            school: school._id,
          });


          tasks.push({
            subject,
            content: `${subject} Tarefa Atrasada teste para ${classId}.`,
            dueDate: new Date(`2024-10-08`),
            recipients: [String(classId)],
            IdTeacher: teachers[index]._id,
            IdClass: String(classId),
            status: "atrasada",
            school: school._id,
          });
      });
    };


    createdClasses.forEach(createdClass => {
      createTasksForClass(createdClass._id, createdClass.subject, createdClass.students);
    });

    const createdTasks = await Task.insertMany(tasks);
    console.log("Tarefas criadas:", createdTasks);




  } catch (error) {
    console.error("Erro ao popular o banco de dados:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedDatabase();
