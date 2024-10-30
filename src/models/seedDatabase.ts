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

async function createStudentStats(userId: string, subjects: string[]) {
  const initialStats = subjects.map((subject, index) => ({
    name: subject,
    averageLevel: Math.max(1, Math.floor(Math.random() * 5)), 
    activitiesCount: Math.floor(Math.random() * 10),           
  }));

  return StudentStats.create({
    userId, 
    subjects: initialStats,
  });
}

async function createSchedule(classId: string) {
  const scheduleItems = [
    { dayOfWeek: "1", startTime: "08:00", endTime: "10:00", topic: "Matemática" },
    { dayOfWeek: "2", startTime: "08:00", endTime: "10:00", topic: "História" },
    { dayOfWeek: "3", startTime: "08:00", endTime: "10:00", topic: "Geografia" },
    { dayOfWeek: "4", startTime: "08:00", endTime: "10:00", topic: "Ciências" },
    { dayOfWeek: "5", startTime: "08:00", endTime: "10:00", topic: "Educação Física" },
  ];

  return Schedule.create({ classId, scheduleItems });
}

async function createAttendance(studentId: string, classId: string) {
  const currentDate = new Date();
  const attendanceRecords = [];

  for (let i = 0; i < 15; i++) {
    const randomDaysBack = Math.floor(Math.random() * 30);
    const randomDate = new Date(currentDate);
    randomDate.setDate(currentDate.getDate() - randomDaysBack);

    const randomHour = Math.floor(Math.random() * 2) + 8; // Horário de entrada entre 8h e 10h
    const entryTime = new Date(randomDate.setHours(randomHour, 0, 0)); // Entrada em horários aleatórios de 8h a 10h
    const exitTime = new Date(entryTime.getTime() + 3600000); // Saída uma hora depois

    const attendedClasses = Math.floor(Math.random() * 5) + 5; // Garantir que o aluno tenha participado de pelo menos 5 aulas

    attendanceRecords.push({
      studentId,
      classId,
      date: randomDate,
      entryTime,
      exitTime,
      attendedClasses,
      attempts: Math.floor(Math.random() * 3),
      recognitionCode: "success",
      notes: "Presença confirmada automaticamente",
    });
  }

  // Criar registros de falta
  for (let i = 0; i < 10; i++) {
    const randomDaysBack = Math.floor(Math.random() * 30);
    const randomDate = new Date(currentDate);
    randomDate.setDate(currentDate.getDate() - randomDaysBack);

    // Simular uma falta sem entrada e saída
    attendanceRecords.push({
      studentId,
      classId,
      date: randomDate,
      entryTime: null,
      exitTime: null,
      attendedClasses: 0,
      attempts: Math.floor(Math.random() * 3),
      recognitionCode: "absent",
      notes: "Falta registrada automaticamente",
    });
  }

  return Attendance.insertMany(attendanceRecords);
}


async function seedDatabase() {
  await mongoose.connect(mongoURI);

  try {
    // Criar escola
    const school = await createSchool({
      name: "Escola Exemplo 3",
      email: "contato3@escolaexemplo.com",
      phone: "987654321",
      cnpj: "12345678200195",
      address: {
        street: "Rua Exemplo 2",
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
        name: "Professor Exemplo3",
        email: "professor3@escolaexemplo.com",
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
        name: "Professor Exemplo4",
        email: "professor4@escolaexemplo.com",
        phone: "987654322",
        password: "senhaSegura",
        role: "professor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Professor 2",
          cep: "12345-679",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "12345678901",
      }),
      createUser({
        name: "Professor Exemplo5",
        email: "professor5@escolaexemplo.com",
        phone: "987654323",
        password: "senhaSegura",
        role: "professor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Professor 3",
          cep: "12345-680",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "12345678902",
      }),
      createUser({
        name: "Professor Exemplo6",
        email: "professor6@escolaexemplo.com",
        phone: "987654324",
        password: "senhaSegura",
        role: "professor",
        IdSchool: school._id,
        approved: true,
        address: {
          street: "Rua do Professor 4",
          cep: "12345-681",
          state: "SP",
          city: "São Paulo",
        },
        cpf: "12345678903",
      }),
    ]);
    
    console.log("Usuários (professores) criados:", teachers);
    
    const students = [
      {
        name: "Aluno Exemplo 1",
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
        name: "Aluno Exemplo 2",
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
        name: "Aluno Exemplo 3",
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
        name: "Aluno Exemplo 4",
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
        name: "Aluno Exemplo 5",
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
        name: "Aluno Exemplo 6",
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
        name: "Aluno Exemplo 7",
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
        name: "Aluno Exemplo 8",
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
        name: "Aluno Exemplo 9",
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
        name: "Aluno Exemplo 10",
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
        name: "Aluno Exemplo 11",
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
        name: "Aluno Exemplo 12",
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
        name: "Aluno Exemplo 13",
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
        name: "Aluno Exemplo 14",
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
        name: "Aluno Exemplo 15",
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
        name: "Aluno Exemplo 16",
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
    
      await createStudentStats(String(student._id), ["Matemática", "História", "Geografia", "Física"]);
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
          createdStudents[0]._id, // Aluno 1
          createdStudents[1]._id, // Aluno 2
          createdStudents[2]._id, // Aluno 3
          createdStudents[3]._id, // Aluno 4
          createdStudents[4]._id, // Aluno 5
        ],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Geografia", "Física"],
      },
      {
        name: "Turma 9B",
        grade: "9º Ano",
        teacher: [teachers[0]._id, teachers[1]._id, teachers[2]._id, teachers[3]._id],
        students: [
          createdStudents[5]._id, // Aluno 6
          createdStudents[6]._id, // Aluno 7
          createdStudents[7]._id, // Aluno 8
          createdStudents[8]._id, // Aluno 9
        ],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Geografia", "Física"],
      },
      {
        name: "Turma 8A",
        grade: "8º Ano",
        teacher: [teachers[0]._id, teachers[1]._id, teachers[2]._id, teachers[3]._id],
        students: [
          createdStudents[10]._id, // Aluno 11
          createdStudents[11]._id, // Aluno 12
          createdStudents[12]._id, // Aluno 13
          createdStudents[13]._id, // Aluno 14
        ],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Geografia", "Física"],
      },
      {
        name: "Turma 8B",
        grade: "8º Ano",
        teacher: [teachers[0]._id, teachers[1]._id, teachers[2]._id, teachers[3]._id],
        students: [
          createdStudents[14]._id, 
          createdStudents[15]._id, 
          createdStudents[9]._id, 
        ],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Geografia", "Física"],
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
    
    const tasks :  any[] = [];
    
    const createTasksForClass = (classId : any, subjects : any) => {
      subjects.forEach((subject: any, index : any) => {
        for (let i = 1; i <= 3; i++) {
          tasks.push({
            subject,
            content: `${subject} Tarefa ${i} para ${classId}.`,
            dueDate: new Date(`2024-12-0${i}`),
            recipients: [String(classId)],
            IdTeacher: teachers[index]._id, // Usando o professor correspondente para cada matéria
            IdClass: String(classId),
            status: "em andamento",
            school: school._id,
          });
        }
      });
    };
    
    // Criar tarefas para cada classe
    createdClasses.forEach(createdClass => {
      createTasksForClass(createdClass._id, createdClass.subject);
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
