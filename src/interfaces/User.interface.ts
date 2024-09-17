export interface UsersInterface {
    name: string;
    email: string;
    phone: string;
    password: string;
    IdSchool?: String;
    cpf: string;
    image?: string;
    confirmpassword?: string;
    role?: 'diretor'|'professor'| 'estudante'| 'coordenador'| 'inspetor'| 'limpeza'| 'cozinha'| 'outro',
    address: {
        street: string;
        cep: string;
        state: string;
        city: string;
    }
  }