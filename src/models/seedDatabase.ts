import mongoose from "mongoose";
import School from "./School";
import User from "./User";
import Class from "./Class";
import Task from "./Task";
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

    // Criar usuário (professor)
    const teacher = await createUser({
      name: "Professor Exemplo3",
      email: "professor3@escolaexemplo.com",
      phone: "987654321",
      password: "senhaSegura",
      role: "professor",
      IdSchool: school._id,
      approved: true,
      address: {
        street: "Rua do Professor",
        cep: "12345-678",
        state: "SP",
        city: "São Paulo",
      },
      cpf: "12345678900",
    });

    console.log("Usuário (professor) criado:", teacher);

    // Criar alunos
    const student1 = await createUser({
      name: "Aluno Exemplo 1",
      email: "aluno1@escolaexemplo.com",
      phone: "123123123",
      password: "senhaSegura",
      role: "estudante",
      IdSchool: school._id,
      approved: true,
      address: {
        street: "Rua do Aluno 1",
        cep: "98765-432",
        state: "SP",
        city: "São Paulo",
      },
      cpf: "98765432100",
    });

    const student2 = await createUser({
      name: "Aluno Exemplo 2",
      email: "aluno2@escolaexemplo.com",
      phone: "321321321",
      password: "senhaSegura",
      role: "estudante",
      IdSchool: school._id,
      approved: true,
      address: {
        street: "Rua do Aluno 2",
        cep: "65432-123",
        state: "SP",
        city: "São Paulo",
      },
      cpf: "12312312300",
    });

    const student3 = await createUser({
      name: "Aluno Exemplo 3",
      email: "aluno3@escolaexemplo.com",
      phone: "3213213221",
      password: "senhaSegura",
      role: "estudante",
      IdSchool: school._id,
      approved: true,
      address: {
        street: "Rua do Aluno 5",
        cep: "65432-133",
        state: "SP",
        city: "São Paulo",
      },
      cpf: "15312312300",
    });

    const student4 = await createUser({
      name: "Aluno Exemplo 4",
      email: "aluno4@escolaexemplo.com",
      phone: "3213243221",
      password: "senhaSegura",
      role: "estudante",
      IdSchool: school._id,
      approved: true,
      address: {
        street: "Rua do Aluno 5",
        cep: "65432-133",
        state: "SP",
        city: "São Paulo",
      },
      cpf: "15312312300",
    });

    console.log("Usuários (alunos) criados:", student1, student2, student3, student4);

    // 4. Criar classe
    const class9A = await Class.create({
      name: "Turma 9A",
      grade: "9º Ano",
      teacher: [teacher._id], // Referência ao professor
      students: [student1._id, student2._id], // Referência aos alunos
      IdSchool: school._id, // Referência à escola
      year: 2024,
      subject: ["Matemática", "História"],
    });

    console.log("Classe criada:", class9A);

    const class8A = await Class.create({
      name: "Turma 8A",
      grade: "8º Ano",
      teacher: [teacher._id],
      students: [student3._id, student4._id],
      IdSchool: school._id,
      year: 2024,
      subject: ["Matemática", "História"],
    });

    console.log("Classe criada:", class8A);

    const tasks = [
      // Tarefas com status "em andamento"
      {
        subject: "Matemática",
        content: "Resolver os exercícios da página 10.",
        dueDate: new Date("2024-12-31"),
        recipients: [String(class9A._id)], 
        IdTeacher: teacher._id,
        IdClass: String(class9A._id),
        status: "em andamento",
        school: school._id,
      },
      {
        subject: "História",
        content: "Leia o capítulo 5 e faça um resumo.",
        dueDate: new Date("2024-12-15"),
        recipients: [String(class9A._id)], 
        IdTeacher: teacher._id,
        IdClass: String(class9A._id),
        status: "em andamento",
        school: school._id,
      },
      {
        subject: "Matemática",
        content: "Resolver os exercícios da página 10.",
        dueDate: new Date("2024-10-12"),
        recipients: [String(class8A._id), String(class9A._id)], 
        IdTeacher: teacher._id,
        IdClass: String(class8A._id),
        status: "em andamento",
        school: school._id,
      },
    
      {
        subject: "Matemática",
        content: "Resolver os exercícios da página 12 e resuma aqui.",
        dueDate: new Date("2024-10-08"),
        recipients: [String(class9A._id)], 
        IdTeacher: teacher._id,
        IdClass: String(class9A._id),
        status: "pendente",
        school: school._id,
        studentResponses: [
          {
            studentId: student1._id, 
            studentName: student1.name, 
            responseContent: "Minha resposta ao teste.",
            selectedAlternative: null,
            attachment: [], 
            submissionDate: new Date(), 
            graded: false, 
            grade: null,
            feedback: null, 
          },
          {
            studentId: student2._id, 
            studentName: student2.name, 
            responseContent: "Minha resposta ao teste.",
            selectedAlternative: null,
            attachment: [], 
            submissionDate: new Date(), 
            graded: false, 
            grade: null,
            feedback: null, 
          },
        ],
  
      },
      {
        subject: "História",
        content: "Leia o capítulo 5 e faça um resumo.",
        dueDate: new Date("2024-08-15"), 
        recipients: [String(class9A._id)],
        IdTeacher: teacher._id,
        IdClass: String(class9A._id),
        status: "atrasada",
        school: school._id,
      },
    
      // Tarefas com status "pronto"
      {
        subject: "História",
        content: "Resumo de todas as atividades.",
        dueDate: new Date("2024-08-15"), // Data vencida
        recipients: [String(class9A._id)],
        IdTeacher: teacher._id,
        IdClass: String(class9A._id),
        status: "pronto",
        school: school._id,
      },
      {
        subject: "História",
        content: "Teste.",
        dueDate: new Date("2024-08-25"), // Data vencida
        recipients: [String(class9A._id)],
        IdTeacher: teacher._id,
        IdClass: String(class9A._id),
        status: "pendente",
        school: school._id,
        studentResponses: [
          {
            studentId: student1._id,
            studentName: student1.name,
            responseContent: "Minha resposta ao teste.",
            selectedAlternative: null,
            attachment: [],
            submissionDate: new Date(), 
            graded: true, 
            grade: 9.5,
            feedback: "Bom trabalho!",
          },
          {
            studentId: student2._id,
            studentName: student2.name,
            responseContent: "Minha resposta ao teste.",
            selectedAlternative: null,
            attachment: [],
            submissionDate: new Date(), 
            graded: true, 
            grade: 5.5,
            feedback: "Precisa melhorar",
          },
        ],
      },
    ];
    
    // Criar as tarefas no banco de dados
    for (const taskData of tasks) {
      const task = await Task.create(taskData);
      console.log(`Tarefa criada: ${task.subject} com status ${task.status}`);
    }
  } catch (error) {
    console.error("Erro ao popular o banco de dados:", error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
