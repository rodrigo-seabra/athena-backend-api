export interface SchoolInterface {
  name: string;
  email: string;
  phone: string;
  inepCode?: string;
  cnpj: string;
  address: {
    street: string;
    cep: string;
    state: string;
    city: string;
  };
  institutionType?:
    | "escola publica"
    | "escola privada"
    | "universidade publica"
    | "universidade publica"
    | "instituto técnico"
    | "creche"
    | "curso livre"
    | "outro";
  educationLevels?:
    | "infantil"
    | "fundamental I"
    | "fundamental II"
    | "médio"
    | "técnico"
    | "superior"
    | "pós-graduação"
    | "mestrado"
    | "doutorado"
    | "educação de jovens e adultos (EJA)"
    | "outro";
  status?: boolean;
  alvara?: string;
  certificadoFuncionamento?: string;
  password: string;
  confirmpassword?: string;
  image?: string;
  pendingRequests:{
    id: string,
    name: string,
    cpf: string
  }[];
}
