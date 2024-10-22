import mongoose from 'mongoose';
import School from './School'; // ajuste o caminho conforme necessário
import User from './User'; // ajuste o caminho conforme necessário
import Class from './Class'; // ajuste o caminho conforme necessário
import Task from './Task'; // ajuste o caminho conforme necessário
import "dotenv/config";

const mongoURI = process.env.CONNECTIONSTRING || 'mongodb://localhost:27017/Athena'; // substitua pelo seu URI do MongoDB

async function seedDatabase() {
  await mongoose.connect(mongoURI);

  try {
    // 1. Criar escola
    const school = await School.create({
      name: 'Escola Exemplo 3',
      email: 'contato3@escolaexemplo.com',
      phone: '987654321',
      cnpj: '12345678200195',
      address: {
        street: 'Rua Exemplo 2',
        cep: '12345-679',
        state: 'SP',
        city: 'São Paulo',
      },
      password: 'senhaSegura',
      status: true,
    });

    console.log('Escola criada:', school);

    // 2. Criar usuário (professor)
    const teacher = await User.create({
      name: 'Professor Exemplo3',
      email: 'professor3@escolaexemplo.com',
      phone: '987654321',
      password: 'senhaSegura',
      role: 'professor',
      IdSchool: school._id, // Referência à escola
      approved: true,
      address: {
        street: 'Rua do Professor',
        cep: '12345-678',
        state: 'SP',
        city: 'São Paulo',
      },
      cpf: '12345678900',
    });

    console.log('Usuário (professor) criado:', teacher);

    // 3. Criar usuário (aluno)
    const student1 = await User.create({
      name: 'Aluno Exemplo 1',
      email: 'aluno1@escolaexemplo.com',
      phone: '123123123',
      password: 'senhaSegura',
      role: 'estudante',
      IdSchool: school._id, // Referência à escola
      approved: true,
      address: {
        street: 'Rua do Aluno 1',
        cep: '98765-432',
        state: 'SP',
        city: 'São Paulo',
      },
      cpf: '98765432100',
    });

    const student2 = await User.create({
      name: 'Aluno Exemplo 2',
      email: 'aluno2@escolaexemplo.com',
      phone: '321321321',
      password: 'senhaSegura',
      role: 'estudante',
      IdSchool: school._id, // Referência à escola
      approved: true,
      address: {
        street: 'Rua do Aluno 2',
        cep: '65432-123',
        state: 'SP',
        city: 'São Paulo',
      },
      cpf: '12312312300',
    });

    console.log('Usuários (alunos) criados:', student1, student2);

    // 4. Criar classe
    const class9A = await Class.create({
      name: 'Turma 9A',
      grade: '9º Ano',
      teacher: [teacher._id], // Referência ao professor
      students: [student1._id, student2._id], // Referência aos alunos
      IdSchool: school._id, // Referência à escola
      year: 2024,
      subject: ['Matemática', 'História'],
    });

    console.log('Classe criada:', class9A);

    // 5. Criar tarefa 1
    const task1 = await Task.create({
      subject: 'Matemática',
      content: 'Resolver os exercícios da página 10.',
      dueDate: new Date('2024-12-31'),
      recipients: [String(class9A._id)], // Referência à classe
      IdTeacher: teacher._id,
      IdClass: String(class9A._id),
      status: 'em andamento',
      school: school._id,
    });

    console.log('Tarefa 1 criada:', task1);

    // 6. Criar tarefa 2
    const task2 = await Task.create({
      subject: 'História',
      content: 'Leia o capítulo 5 e faça um resumo.',
      dueDate: new Date('2024-12-15'),
      recipients: [String(class9A._id)], // Referência à classe
      IdTeacher: teacher._id,
      IdClass: String(class9A._id),
      status: 'em andamento',
      school: school._id,
    });

    console.log('Tarefa 2 criada:', task2);

        // 6. Criar tarefa 3
        const task3 = await Task.create({
          subject: 'História',
          content: 'Leia o capítulo 5 e faça um resumo.',
          dueDate: new Date('2024-08-15'),
          recipients: [String(class9A._id)], // Referência à classe
          IdTeacher: teacher._id,
          IdClass: String(class9A._id),
          status: 'em andamento',
          school: school._id,
        });
    
        console.log('Tarefa 2 criada:', task3);

                // 6. Criar tarefa 4
                const task4 = await Task.create({
                  subject: 'História',
                  content: 'Resumo de todas a as atividades.',
                  dueDate: new Date('2024-08-15'),
                  recipients: [String(class9A._id)], 
                  IdTeacher: teacher._id,
                  IdClass: String(class9A._id),
                  status: 'pronto',
                  school: school._id,
                });
            
                console.log('Tarefa 5 criada:', task4);
                const task5 = await Task.create({
                  subject: 'História',
                  content: 'Teste.',
                  dueDate: new Date('2024-08-25'),
                  recipients: [String(class9A._id)], 
                  IdTeacher: teacher._id,
                  IdClass: String(class9A._id),
                  status: 'pronto',
                  school: school._id,
                });
            
                console.log('Tarefa 4 criada:', task4);

  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
