import mongoose from "mongoose";
import School from "./School";
import User from "./User";
import Class from "./Class";
import Task from "./Task";
import StudentStats from "./StudentStats"; // Certifique-se de importar o modelo StudentStats
import "dotenv/config";
import bcrypt from "bcrypt";

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
  const initialStats = subjects.map(subject => ({
    name: subject,       // Atributo name, conforme definido no schema
    averageLevel: 1,     // Atributo averageLevel, valor inicial
    activitiesCount: 0    // Atributo activitiesCount, valor inicial
  }));

  return StudentStats.create({
    userId, 
    subjects: initialStats, // Certifique-se de que isso está correto
  });
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
    
    // Criar alunos
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
          street: "Rua do Aluno 5",
          cep: "65432-133",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Exemplo 4",
        email: "aluno4@escolaexemplo.com",
        phone: "3213243221",
        cpf: "15312312300",
        address: {
          street: "Rua do Aluno 5",
          cep: "65432-133",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Exemplo 5",
        email: "aluno5@escolaexemplo.com",
        phone: "3213243222",
        cpf: "15312312301",
        address: {
          street: "Rua do Aluno 6",
          cep: "65432-135",
          state: "SP",
          city: "São Paulo",
        },
      },
      {
        name: "Aluno Exemplo 6",
        email: "aluno6@escolaexemplo.com",
        phone: "3213243223",
        cpf: "15312312302",
        address: {
          street: "Rua do Aluno 7",
          cep: "65432-136",
          state: "SP",
          city: "São Paulo",
        },
      },
    ];
    
    const createdStudents = await Promise.all(students.map(async studentData => {
      const student = await createUser({
        ...studentData,
        password: "senhaSegura",
        role: "estudante",
        IdSchool: school._id,
        approved: true,
      });
    
      await createStudentStats(String(student._id), ["Matemática", "História", "Geografia", "Ciências"]);
      return student;
    }));
    
    console.log("Usuários (alunos) criados:", createdStudents);
    
    // Criar classes
    const classes = [
      {
        name: "Turma 9A",
        grade: "9º Ano",
        teacher: [teachers[0]._id, teachers[1]._id, teachers[2]._id, teachers[3]._id],
        students: [createdStudents[0]._id, createdStudents[1]._id, createdStudents[4]._id],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Geografia", "Ciências"],
      },
      {
        name: "Turma 9B",
        grade: "9º Ano",
        teacher: [teachers[0]._id, teachers[1]._id, teachers[2]._id, teachers[3]._id],
        students: [createdStudents[2]._id, createdStudents[3]._id, createdStudents[5]._id],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Geografia", "Ciências"],
      },
      {
        name: "Turma 8A",
        grade: "8º Ano",
        teacher: [teachers[0]._id, teachers[1]._id, teachers[2]._id, teachers[3]._id],
        students: [createdStudents[0]._id, createdStudents[1]._id],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Geografia", "Ciências"],
      },
      {
        name: "Turma 8B",
        grade: "8º Ano",
        teacher: [teachers[0]._id, teachers[1]._id, teachers[2]._id, teachers[3]._id],
        students: [createdStudents[2]._id, createdStudents[3]._id],
        IdSchool: school._id,
        year: 2024,
        subject: ["Matemática", "História", "Geografia", "Ciências"],
      },
    ];
    
    const createdClasses = await Class.insertMany(classes);
    console.log("Classes criadas:", createdClasses);
    
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
