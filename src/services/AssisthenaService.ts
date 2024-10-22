import natural from "natural";
import fs from "fs";
import path from "path";

export class AssisthenaService {
  private tokenizer: natural.WordTokenizer;
  private classifier: natural.BayesClassifier;
  private answers: { [intent: string]: { [userType: string]: string[] } };
  private insights: { [userType: string]: { [context: string]: string[] } };

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.answers = this.loadAnswersFromJSON();
    this.insights = this.loadInsightsFromJSON();
    this.trainClassifier();
  }

  private loadAnswersFromJSON(): {
    [intent: string]: { [userType: string]: string[] };
  } {
    const filePath = path.join(__dirname, "../data/answers.json");
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }
  private loadInsightsFromJSON(): {
    [userType: string]: { [context: string]: string[] };
  } {
    const filePath = path.join(__dirname, "../data/insights.json");
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  private trainClassifier() {
    this.classifier.addDocument(
      "o professor está pedindo mais detalhes e feedbacks e insights sobre o 4ano",
      "response_for_4_class_professor"
    );
    this.classifier.addDocument(
      "o professor está pedindo mais detalhes e feedbacks e insights sobre o 5ano",
      "response_for_5_class_professor"
    );
    this.classifier.addDocument(
      "o professor está pedindo mais detalhes e feedbacks e insights sobre o 6ano",
      "response_for_6_class_professor"
    );
    this.classifier.addDocument(
      "o professor está pedindo mais detalhes e feedbacks e insights sobre o 7ano",
      "response_for_7_class_professor"
    );
    this.classifier.addDocument(
      "o professor está pedindo mais detalhes e feedbacks e insights sobre o 8ano",
      "response_for_8_class_professor"
    );
    this.classifier.addDocument(
      "o professor está pedindo mais detalhes e feedbacks e insights sobre o 9ano",
      "response_for_9_class_professor"
    );

    // Anos do Ensino Médio
    this.classifier.addDocument(
      "o professor está pedindo mais detalhes e feedbacks e insights sobre o 1ano",
      "response_for_1_high_school_professor"
    );
    this.classifier.addDocument(
      "o professor está pedindo mais detalhes e feedbacks e insights sobre o 2ano",
      "response_for_2_high_school_professor"
    );
    this.classifier.addDocument(
      "o professor está pedindo mais detalhes e feedbacks e insights sobre o 3ano",
      "response_for_3_high_school_professor"
    );

    this.classifier.addDocument(
      "quais temas são importantes na história",
      "duvidas_historicas_conteudo"
    );
    this.classifier.addDocument(
      "como ensinar revolução industrial",
      "metodologia_historica"
    );
    this.classifier.addDocument(
      "quais são as consequências da 2ª guerra mundial",
      "consequencias_historicas"
    );
    this.classifier.addDocument(
      "importância da história na formação do cidadão",
      "importancia_historica"
    );
    this.classifier.addDocument(
      "quais fontes usar para estudar história",
      "fontes_historicas"
    );
    this.classifier.addDocument(
      "quais são os eventos mais importantes da Idade Média",
      "duvidas_historicas_idade_media"
    );
    this.classifier.addDocument(
      "principais acontecimentos da Idade Média",
      "duvidas_historicas_idade_media"
    );
    this.classifier.addDocument(
      "o que foi importante na Idade Média",
      "duvidas_historicas_idade_media"
    );
    this.classifier.addDocument(
      "como foi a Idade Média",
      "duvidas_historicas_idade_media"
    );
    this.classifier.addDocument(
      "como ensinar sobre a colonização do Brasil",
      "metodologia_colonizacao"
    );
    this.classifier.addDocument(
      "dicas para ensinar a colonização do Brasil",
      "metodologia_colonizacao"
    );
    this.classifier.addDocument(
      "qual a melhor maneira de ensinar a colonização",
      "metodologia_colonizacao"
    );

    // Matemática
    this.classifier.addDocument(
      "como resolver equações do 2º grau",
      "duvidas_matematica_equacoes"
    );
    this.classifier.addDocument(
      "importância da matemática no dia a dia",
      "importancia_matematica"
    );
    this.classifier.addDocument(
      "quais são os principais conceitos de geometria",
      "conceitos_geometria"
    );

    // Ciências
    this.classifier.addDocument(
      "como funciona o ciclo da água",
      "ciclo_da_agua"
    );
    this.classifier.addDocument(
      "quais são as leis de Newton",
      "letras_de_newton"
    );
    this.classifier.addDocument(
      "importância da biologia na saúde",
      "importancia_biologia"
    );

    // Língua Portuguesa
    this.classifier.addDocument("como melhorar a redação", "duvidas_redacao");
    this.classifier.addDocument(
      "quais são os principais gêneros textuais",
      "generos_textuais"
    );
    this.classifier.addDocument(
      "importância da literatura",
      "importancia_literatura"
    );

    // Orientações Gerais
    this.classifier.addDocument(
      "como lidar com a ansiedade na escola",
      "orientacao_ansiedade"
    );
    this.classifier.addDocument(
      "como organizar o tempo para estudar",
      "organizacao_tempo"
    );
    this.classifier.addDocument(
      "dicas para trabalhos em grupo",
      "dicas_trabalhos_grupo"
    );

    // Projetos de Vida
    this.classifier.addDocument(
      "como planejar meu futuro",
      "planejamento_futuro"
    );
    this.classifier.addDocument(
      "importância do autoconhecimento",
      "autoconhecimento"
    );
    this.classifier.addDocument(
      "como definir metas pessoais",
      "definicao_metas"
    );

    // Saudações
    this.classifier.addDocument("oi", "greeting");
    this.classifier.addDocument("olá", "greeting");
    this.classifier.addDocument("bom dia", "greeting");
    this.classifier.addDocument("boa tarde", "greeting");
    this.classifier.addDocument("boa noite", "greeting");

    this.classifier.train();
  }

  addAnswer(intent: string, userType: string, responses: string[]) {
    if (!this.answers[intent]) {
      this.answers[intent] = {};
    }
    if (!this.answers[intent][userType]) {
      this.answers[intent][userType] = [];
    }
    this.answers[intent][userType] = [
      ...this.answers[intent][userType],
      ...responses,
    ];
  }

  classifyMessage(message: string): string {
    const result = this.classifier.getClassifications(message);
    if (result.length > 0) {
      return result[0].label;
    }
    return "default";
  }

  processMessage(message: string): string {
    return message
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  analyzeSentiment(message: string): string {
    const analyzer = new natural.SentimentAnalyzer(
      "Portuguese",
      natural.PorterStemmer,
      "afinn"
    );
    const sentiment = analyzer.getSentiment(this.tokenizer.tokenize(message));

    return sentiment >= 0 ? "positive" : "negative";
  }

  getResponseForIntent(intent: string, userType: string): string {
    
    if (!this.answers[intent] || !this.answers[intent][userType]) {
      return "Desculpe, não entendi sua pergunta.";
    }
    const responses = this.answers[intent][userType];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  getInsights(userType: string, context: string = "default"): string {
    if (!this.insights[userType]) {
      return "Sem insights disponíveis para este tipo de usuário.";
    }

    const userInsights = this.insights[userType];
    const insightsArray = userInsights[context] || userInsights["default"];

    if (!insightsArray || insightsArray.length === 0) {
      return "Não há insights disponíveis para este contexto.";
    }

    return insightsArray[Math.floor(Math.random() * insightsArray.length)];
  }
}
