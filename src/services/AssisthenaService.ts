import natural from 'natural';

export class AssisthenaService {
  private tokenizer: natural.WordTokenizer;
  private classifier: natural.BayesClassifier;
  private answers: { [intent: string]: { [userType: string]: string[] } }; // Alterado para incluir userType

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.answers = {};
    this.trainClassifier();
  }

  private trainClassifier() {

    // História
    this.classifier.addDocument('quais temas são importantes na história', 'duvidas_historicas_conteudo');
    this.classifier.addDocument('como ensinar revolução industrial', 'metodologia_historica');
    this.classifier.addDocument('quais são as consequências da 2ª guerra mundial', 'consequencias_historicas');
    this.classifier.addDocument('importância da história na formação do cidadão', 'importancia_historica');
    this.classifier.addDocument('quais fontes usar para estudar história', 'fontes_historicas');

    // Matemática
    this.classifier.addDocument('como resolver equações do 2º grau', 'duvidas_matematica_equacoes');
    this.classifier.addDocument('importância da matemática no dia a dia', 'importancia_matematica');
    this.classifier.addDocument('quais são os principais conceitos de geometria', 'conceitos_geometria');

    // Ciências
    this.classifier.addDocument('como funciona o ciclo da água', 'ciclo_da_agua');
    this.classifier.addDocument('quais são as leis de Newton', 'letras_de_newton');
    this.classifier.addDocument('importância da biologia na saúde', 'importancia_biologia');

    // Língua Portuguesa
    this.classifier.addDocument('como melhorar a redação', 'duvidas_redacao');
    this.classifier.addDocument('quais são os principais gêneros textuais', 'generos_textuais');
    this.classifier.addDocument('importância da literatura', 'importancia_literatura');

    // Orientações Gerais
    this.classifier.addDocument('como lidar com a ansiedade na escola', 'orientacao_ansiedade');
    this.classifier.addDocument('como organizar o tempo para estudar', 'organizacao_tempo');
    this.classifier.addDocument('dicas para trabalhos em grupo', 'dicas_trabalhos_grupo');

    // Projetos de Vida
    this.classifier.addDocument('como planejar meu futuro', 'planejamento_futuro');
    this.classifier.addDocument('importância do autoconhecimento', 'autoconhecimento');
    this.classifier.addDocument('como definir metas pessoais', 'definicao_metas');

    // Saudações
    this.classifier.addDocument('oi', 'greeting');
    this.classifier.addDocument('olá', 'greeting');
    this.classifier.addDocument('bom dia', 'greeting');
    this.classifier.addDocument('boa tarde', 'greeting');
    this.classifier.addDocument('boa noite', 'greeting');

    // Respostas para Alunos
    // História
    this.addAnswer('duvidas_historicas_conteudo', 'estudante', [
      'Você pode revisar os principais eventos históricos, além de consultar livros e artigos especializados.',
      'Recomendo fazer uma linha do tempo para visualizar melhor os eventos.',
    ]);

    this.addAnswer('metodologia_historica', 'estudante', [
      'A Revolução Industrial trouxe mudanças significativas. Tente entender as condições sociais e econômicas da época.',
      'Sugiro assistir a documentários e ler sobre os inventores da época para enriquecer seu conhecimento.',
    ]);

    this.addAnswer('consequencias_historicas', 'estudante', [
      'As consequências da 2ª Guerra Mundial incluem a criação da ONU e a divisão da Europa em blocos.',
      'Recomendo ler sobre a Guerra Fria para entender melhor as repercussões do conflito.',
    ]);

    this.addAnswer('importancia_historica', 'estudante', [
      'Estudar história ajuda a entender os erros do passado e a construir um futuro melhor.',
      'Pode ser interessante refletir sobre como eventos históricos moldam a sociedade atual.',
    ]);

    this.addAnswer('fontes_historicas', 'estudante', [
      'Livros didáticos, artigos acadêmicos e documentos de época são ótimas fontes.',
      'Visitar museus e exposições também pode enriquecer sua pesquisa.',
    ]);

    // Matemática
    this.addAnswer('duvidas_matematica_equacoes', 'estudante', [
      'Para resolver equações do 2º grau, você pode usar a fórmula de Bhaskara.',
      'Pratique com exercícios para fixar o conteúdo.',
    ]);

    this.addAnswer('importancia_matematica', 'estudante', [
      'A matemática é fundamental no nosso dia a dia, desde fazer compras até entender a economia.',
      'Procure exemplos práticos que conectem a matemática à sua rotina.',
    ]);

    this.addAnswer('conceitos_geometria', 'estudante', [
      'Os principais conceitos de geometria incluem pontos, linhas, ângulos e figuras planas.',
      'Visualizar essas formas pode ajudar na sua compreensão.',
    ]);

    // Ciências
    this.addAnswer('ciclo_da_agua', 'estudante', [
      'O ciclo da água envolve evaporação, condensação e precipitação.',
    ]);

    this.addAnswer('letras_de_newton', 'estudante', [
      'As leis de Newton explicam o movimento dos corpos e são fundamentais para a física.',
      'Experimentos simples podem ilustrar essas leis na prática.',
    ]);

    this.addAnswer('importancia_biologia', 'estudante', [
      'A biologia é essencial para entender a vida e os organismos que nos cercam.',
      'Pesquisas sobre saúde e meio ambiente podem ser bastante enriquecedoras.',
    ]);

    // Língua Portuguesa
    this.addAnswer('duvidas_redacao', 'estudante', [
      'Leia bastante e pratique a escrita para melhorar sua redação.',
      'Considere fazer esboços antes de escrever a versão final.',
    ]);

    this.addAnswer('generos_textuais', 'estudante', [
      'Os principais gêneros textuais incluem narrativo, descritivo, dissertativo e argumentativo.',
      'Entender as características de cada gênero pode melhorar sua escrita.',
    ]);

    this.addAnswer('importancia_literatura', 'estudante', [
      'A literatura desenvolve a criatividade e a empatia.',
      'Leia diferentes autores e estilos para expandir seus horizontes.',
    ]);

    // Orientações Gerais
    this.addAnswer('orientacao_ansiedade', 'estudante', [
      'Técnicas de respiração e meditação podem ajudar a controlar a ansiedade.',
      'Conversar com alguém de confiança também pode ser muito útil.',
    ]);

    this.addAnswer('organizacao_tempo', 'estudante', [
      'Use um planner ou aplicativos de organização para gerenciar seu tempo.',
      'Defina horários específicos para estudar e para lazer.',
    ]);

    this.addAnswer('dicas_trabalhos_grupo', 'estudante', [
      'Divida as tarefas de acordo com as habilidades de cada membro.',
      'Estabeleçam prazos claros e comuniquem-se frequentemente.',
    ]);

    // Projetos de Vida
    this.addAnswer('planejamento_futuro', 'estudante', [
      'Faça uma lista de seus interesses e habilidades para planejar seu futuro.',
      'Considere buscar orientação vocacional.',
    ]);

    this.addAnswer('autoconhecimento', 'estudante', [
      'Refletir sobre suas experiências e sentimentos é essencial para o autoconhecimento.',
      'Exercícios de escrita podem ajudar nesse processo.',
    ]);

    this.addAnswer('definicao_metas', 'estudante', [
      'Defina metas SMART: específicas, mensuráveis, alcançáveis, relevantes e temporais.',
      'Revisite suas metas regularmente para avaliar seu progresso.',
    ]);

    // Saudações
    this.addAnswer('greeting', 'estudante', [
      'Oi! Como posso ajudar você hoje?',
      'Olá! Espero que esteja tendo um bom dia!',
      'Bom dia! Estou aqui para ajudar com suas dúvidas.',
    ]);

    // Respostas para Professores
    // História
    this.addAnswer('duvidas_historicas_conteudo', 'professor', [
      'Considere revisar os principais eventos e métodos de ensino que envolvem a história.',
      'É importante discutir a importância do estudo da história em suas aulas.',
    ]);

    this.addAnswer('metodologia_historica', 'professor', [
      'Utilize abordagens interativas, como debates e simulações, para ensinar a Revolução Industrial.',
      'Incluir fontes primárias pode enriquecer a compreensão dos alunos sobre a época.',
    ]);

    this.addAnswer('consequencias_historicas', 'professor', [
      'Explore as diferentes interpretações das consequências da 2ª Guerra Mundial em suas aulas.',
      'Considere usar estudos de caso para ilustrar como a guerra moldou diferentes regiões do mundo.',
    ]);

    this.addAnswer('importancia_historica', 'professor', [
      'A importância da história deve ser contextualizada no cotidiano dos alunos.',
      'Desenvolva projetos que conectem eventos históricos a questões sociais contemporâneas.',
    ]);

    this.addAnswer('fontes_historicas', 'professor', [
      'Incentive os alunos a pesquisarem em bibliotecas e arquivos digitais para uma compreensão mais profunda.',
      'Considere fazer parcerias com museus locais para visitas educativas.',
    ]);

    // Matemática
    this.addAnswer('duvidas_matematica_equacoes', 'professor', [
      'Apresente diferentes métodos de resolução para enriquecer o aprendizado dos alunos.',
      'Considere o uso de ferramentas tecnológicas para ilustrar os conceitos.',
    ]);

    this.addAnswer('importancia_matematica', 'professor', [
      'Mostre a relevância da matemática em várias profissões e no cotidiano.',
      'Promova projetos que conectem matemática com outras disciplinas.',
    ]);

    this.addAnswer('conceitos_geometria', 'professor', [
      'Utilize atividades práticas para ensinar os conceitos de geometria.',
      'Promova jogos e desafios que incentivem o raciocínio espacial.',
    ]);

    // Ciências
    this.addAnswer('ciclo_da_agua', 'professor', [
      'Utilize recursos visuais e experimentos para explicar o ciclo da água.',
      'Promova discussões sobre a importância da água para o meio ambiente.',
    ]);

    this.addAnswer('letras_de_newton', 'professor', [
      'Experimentos práticos ajudam a ilustrar as leis de Newton de forma clara.',
      'Explore exemplos do dia a dia que exemplifiquem essas leis.',
    ]);

    this.addAnswer('importancia_biologia', 'professor', [
      'Conecte os conceitos de biologia à saúde e ao meio ambiente.',
      'Incentive discussões sobre questões biológicas atuais.',
    ]);

    // Língua Portuguesa
    this.addAnswer('duvidas_redacao', 'professor', [
      'Crie rubricas claras para avaliar as redações e ajude os alunos a compreenderem o feedback.',
      'Promova oficinas de escrita criativa.',
    ]);

    this.addAnswer('generos_textuais', 'professor', [
      'Desenvolva atividades que explorem diferentes gêneros textuais em sala de aula.',
      'Incentive a leitura crítica de textos variados.',
    ]);

    this.addAnswer('importancia_literatura', 'professor', [
      'A literatura deve ser explorada como ferramenta de empatia e crítica social.',
      'Proponha debates sobre os temas abordados nas obras literárias.',
    ]);

    // Orientações Gerais
    this.addAnswer('orientacao_ansiedade', 'professor', [
      'Converse com os alunos sobre técnicas de controle da ansiedade.',
      'Crie um ambiente acolhedor e aberto para discussões sobre saúde mental.',
    ]);

    this.addAnswer('organizacao_tempo', 'professor', [
      'Ensine seus alunos a elaborar cronogramas de estudo.',
      'Incentive a prática de dividir grandes tarefas em partes menores.',
    ]);

    this.addAnswer('dicas_trabalhos_grupo', 'professor', [
      'Ensine os alunos a delegar tarefas e a respeitar os prazos.',
      'Promova reflexões sobre a importância do trabalho em equipe.',
    ]);

    // Projetos de Vida
    this.addAnswer('planejamento_futuro', 'professor', [
      'Incentive seus alunos a refletirem sobre suas paixões e interesses.',
      'Ofereça workshops de orientação vocacional.',
    ]);

    this.addAnswer('autoconhecimento', 'professor', [
      'Incorpore atividades de autoconhecimento nas aulas de forma lúdica.',
      'Promova discussões sobre autoimagem e autoestima.',
    ]);

    this.addAnswer('definicao_metas', 'professor', [
      'Ensine a importância de estabelecer metas realistas e alcançáveis.',
      'Crie um espaço para que os alunos compartilhem suas metas e progressos.',
    ]);

    // Respostas para Diretores
    // História
    this.addAnswer('duvidas_historicas_conteudo', 'instituicao', [
      'Recomendo revisar as diretrizes curriculares sobre a importância da história.',
      'As avaliações devem refletir a compreensão dos alunos sobre os temas abordados.',
    ]);

    this.addAnswer('metodologia_historica', 'instituicao', [
      'É fundamental proporcionar formação contínua para professores sobre metodologias ativas.',
      'Considere a criação de grupos de estudo entre os docentes para troca de experiências.',
    ]);

    this.addAnswer('consequencias_historicas', 'instituicao', [
      'Promova eventos educativos que discutam as consequências da 2ª Guerra Mundial na sociedade atual.',
      'Encoraje os alunos a participar de debates e projetos relacionados a esses temas.',
    ]);

    this.addAnswer('importancia_historica', 'instituicao', [
      'Incentive a discussão sobre a importância da história nas reuniões pedagógicas.',
      'Desenvolva materiais que ajudem os alunos a conectar história com cidadania e ética.',
    ]);

    this.addAnswer('fontes_historicas', 'instituicao', [
      'Facilite o acesso a bibliotecas e recursos digitais para pesquisa histórica.',
      'Considere a realização de oficinas para capacitar alunos e professores na pesquisa de fontes.',
    ]);

    // Matemática
    this.addAnswer('duvidas_matematica_equacoes', 'instituicao', [
      'Invista em tecnologia e recursos didáticos para apoiar o ensino da matemática.',
      'Promova a formação de professores em novas metodologias de ensino.',
    ]);

    this.addAnswer('importancia_matematica', 'instituicao', [
      'Encoraje a interdisciplinaridade ao conectar a matemática com outras áreas do conhecimento.',
      'Organize eventos que mostrem a aplicação prática da matemática.',
    ]);

    this.addAnswer('conceitos_geometria', 'instituicao', [
      'Proporcione oficinas práticas para alunos e professores sobre geometria.',
      'Promova desafios e competições para estimular o aprendizado.',
    ]);

    // Ciências
    this.addAnswer('ciclo_da_agua', 'instituicao', [
      'Incentive projetos sobre sustentabilidade e conservação da água.',
      'Considere a parceria com instituições que promovam educação ambiental.',
    ]);

    this.addAnswer('letras_de_newton', 'instituicao', [
      'Realize workshops e palestras com especialistas em física.',
      'Crie um ambiente que valorize a curiosidade científica dos alunos.',
    ]);

    this.addAnswer('importancia_biologia', 'instituicao', [
      'Desenvolva parcerias com universidades para palestras e atividades práticas.',
      'Incentive a pesquisa e projetos em biologia com foco em temas contemporâneos.',
    ]);

    // Língua Portuguesa
    this.addAnswer('duvidas_redacao', 'instituicao', [
      'Realize concursos de redação e reconheça os melhores trabalhos.',
      'Ofereça formação para professores sobre avaliação de textos.',
    ]);

    this.addAnswer('generos_textuais', 'instituicao', [
      'Incentive a criação de um clube do livro na escola.',
      'Desenvolva atividades interdisciplinares envolvendo diferentes gêneros textuais.',
    ]);

    this.addAnswer('importancia_literatura', 'instituicao', [
      'Promova feiras de livros e atividades culturais que envolvam a literatura.',
      'Incentive a leitura crítica e o debate sobre temas literários.',
    ]);

    // Orientações Gerais
    this.addAnswer('orientacao_ansiedade', 'instituicao', [
      'Ofereça suporte psicológico para alunos que enfrentam ansiedade.',
      'Crie campanhas de conscientização sobre saúde mental na escola.',
    ]);

    this.addAnswer('organizacao_tempo', 'instituicao', [
      'Realize workshops de organização e planejamento para alunos e professores.',
      'Incentive o uso de ferramentas digitais para gestão do tempo.',
    ]);

    this.addAnswer('dicas_trabalhos_grupo', 'instituicao', [
      'Crie um guia para o trabalho em grupo que os alunos possam consultar.',
      'Promova discussões sobre a dinâmica de grupo e o papel de cada membro.',
    ]);

    // Projetos de Vida
    this.addAnswer('planejamento_futuro', 'instituicao', [
      'Desenvolva programas de orientação vocacional na escola.',
      'Organize feiras de profissões para os alunos conhecerem diferentes carreiras.',
    ]);

    this.addAnswer('autoconhecimento', 'instituicao', [
      'Promova atividades que ajudem os alunos a se conhecerem melhor.',
      'Incentive a prática de reflexões e autoanálise.',
    ]);

    this.addAnswer('definicao_metas', 'instituicao', [
      'Crie espaços para os alunos compartilharem suas metas e progressos.',
      'Realize workshops sobre definição de metas e planejamento pessoal.',
    ]);


    this.classifier.train();
  }

  addAnswer(intent: string, userType: string, responses: string[]) {
    if (!this.answers[intent]) {
      this.answers[intent] = {};
    }
    if (!this.answers[intent][userType]) {
      this.answers[intent][userType] = [];
    }
    this.answers[intent][userType] = [...this.answers[intent][userType], ...responses];
  }

  classifyMessage(message: string): string {
    const result = this.classifier.getClassifications(message);
    if (result.length > 0) {
      return result[0].label; // Retorna a intenção mais provável
    }
    return 'default';
  }

  processMessage(message: string): string {
    return message.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  analyzeSentiment(message: string): string {
    const analyzer = new natural.SentimentAnalyzer('Portuguese', natural.PorterStemmer, 'afinn');
    const sentiment = analyzer.getSentiment(this.tokenizer.tokenize(message));

    return sentiment >= 0 ? 'positive' : 'negative';
  }

  getResponseForIntent(intent: string, userType: string): string {
    if (!this.answers[intent] || !this.answers[intent][userType]) {
        return 'Desculpe, não entendi sua pergunta.';
    }
    const responses = this.answers[intent][userType];
    return responses[Math.floor(Math.random() * responses.length)];
}

}
