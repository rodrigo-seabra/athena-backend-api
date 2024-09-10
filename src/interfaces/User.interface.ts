export interface UsersInterface {
    name: string;
    email: string;
    phone: string;
    password: string;
    schoolId?: Number;
    cpf: string;
    image?: string;
    confirmpassword?: string;
    role?: 'diretor'|'professor'| 'estudante'| 'cordenador'| 'inspetor'| 'limpeza'| 'cozinha'| 'outro',
    adress: {
        street: string;
        cep: string;
        state: string;
        city: string;
    }
  }