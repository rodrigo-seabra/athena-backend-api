import mongoose from 'mongoose';
import School from './School'; // ajuste o caminho conforme necessário
import User from './User'; // ajuste o caminho conforme necessário
import Task from './Task'; // ajuste o caminho conforme necessário

const mongoURI = 'mongodb://localhost:27017/Athena'; // substitua pelo seu URI do MongoDB

async function seedDatabase() {
  await mongoose.connect(mongoURI);

  try {
    // 1. Criar escola
    const school = await School.create({
      name: 'Escola Exemplo 2',
      email: 'contato2@escolaexemplo.com',
      phone: '123456789',
      cnpj: '12345678200195',
      address: {
        street: 'Rua Exemplo',
        cep: '12345-678',
        state: 'SP',
        city: 'São Paulo',
      },
      password: 'senhaSegura',
      status: true,
    });

    console.log('Escola criada:', school);

    // 2. Criar usuário (professor)
    const teacher = await User.create({
      name: 'Professor Exemplo2',
      email: 'professor2@escolaexemplo.com',
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
    const student = await User.create({
      name: 'Aluno Exemplo',
      email: 'aluno@escolaexemplo.com',
      phone: '123123123',
      password: 'senhaSegura',
      role: 'estudante',
      IdSchool: school._id, // Referência à escola
      approved: true,
      address: {
        street: 'Rua do Aluno',
        cep: '98765-432',
        state: 'SP',
        city: 'São Paulo',
      },
      cpf: '98765432100',
    });

    console.log('Usuário (aluno) criado:', student);

    // 4. Criar tarefa 1
    const task1 = await Task.create({
      subject: 'Matemática',
      content: 'Resolver os exercícios da página 10.',
      dueDate: new Date('2024-12-31'),
      recipients: [teacher._id], // Referência ao professor
      IdTeacher: teacher._id,
      IdClass: 'classe_id_aqui', // ajuste conforme necessário
      status: 'em andamento',
      school: school._id,
    });

    console.log('Tarefa 1 criada:', task1);

    // 5. Criar tarefa 2
    const task2 = await Task.create({
      subject: 'História',
      content: 'Leia o capítulo 5 e faça um resumo.',
      dueDate: new Date('2024-12-15'),
      recipients: [student._id], // Referência ao aluno
      IdTeacher: teacher._id,
      IdClass: 'classe_id_aqui', // ajuste conforme necessário
      status: 'em andamento',
      school: school._id,
    });

    console.log('Tarefa 2 criada:', task2);
    
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
