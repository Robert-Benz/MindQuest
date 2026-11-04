export const textoTermos = (
  <div className="space-y-6 text-justify text-slate-600">
    <div className="mb-2 border-b border-slate-100 pb-4">
      <h1 className="text-lg font-black text-slate-900 leading-tight">Termos de Uso e Política de Privacidade do MindQuest</h1>
      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Última atualização: Novembro de 2026</p>
    </div>

    <p className="leading-relaxed">
      Este documento estabelece as regras para o uso do aplicativo MindQuest e como tratamos seus dados pessoais, em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
    </p>

    <section>
      <h2 className="text-sm font-bold text-slate-800 mb-2">1. Coleta e Tratamento de Dados Pessoais e Sensíveis</h2>
      <p className="mb-2 leading-relaxed">O MindQuest coleta informações para personalizar sua jornada de bem-estar. Devido à natureza do aplicativo, processamos dados sensíveis referentes à sua saúde emocional:</p>
      <ul className="list-disc pl-5 space-y-1.5 marker:text-[#E97451]">
        <li><strong className="text-slate-700">Dados de Cadastro:</strong> Nome, e-mail e senha (gerenciados com criptografia de ponta).</li>
        <li><strong className="text-slate-700">Dados de Saúde e Comportamento:</strong> Registros diários de humor, notas/desabafos pessoais, preferências de lazer (música, filmes, atividades) e histórico de missões concluídas.</li>
        <li><strong className="text-slate-700">Finalidade:</strong> Estes dados são utilizados exclusivamente para o funcionamento do aplicativo, acompanhamento da sua evolução gamificada (XP, Níveis, Troféus) e formulação das rotinas de bem-estar.</li>
      </ul>
    </section>

    <section>
      <h2 className="text-sm font-bold text-slate-800 mb-2">2. Processamento por Inteligência Artificial (IA)</h2>
      <p className="mb-2 leading-relaxed">Para fornecer insights diários, resumos semanais e gerar missões personalizadas, o MindQuest integra a tecnologia de Inteligência Artificial do Google (Gemini API).</p>
      <ul className="list-disc pl-5 space-y-1.5 marker:text-[#E97451]">
        <li><strong className="text-slate-700">Como funciona:</strong> Seus dados de humor, anotações diárias e preferências são enviados de forma segura para a IA elaborar as recomendações.</li>
        <li><strong className="text-slate-700">Proteção e Privacidade:</strong> Seus dados não são utilizados para treinar modelos públicos de Inteligência Artificial. O processamento ocorre exclusivamente no momento da sua requisição para gerar a resposta que você visualiza no aplicativo.</li>
      </ul>
    </section>

    <section>
      <h2 className="text-sm font-bold text-slate-800 mb-2">3. Compartilhamento Clínico (Código de Paciente)</h2>
      <p className="mb-2 leading-relaxed">O MindQuest oferece uma funcionalidade de acompanhamento clínico estritamente opcional (opt-in).</p>
      <ul className="list-disc pl-5 space-y-1.5 marker:text-[#E97451]">
        <li><strong className="text-slate-700">Controle Total do Usuário:</strong> Seus dados emocionais não são compartilhados com nenhum terceiro, exceto se você decidir fornecer voluntariamente o seu Código de Paciente a um profissional de saúde (psicólogo, terapeuta ou psiquiatra).</li>
        <li><strong className="text-slate-700">Revogação:</strong> Você pode desconectar o profissional a qualquer momento na aba "Terapeuta" do seu Perfil. A revogação corta imediatamente o acesso do profissional ao seu histórico.</li>
      </ul>
    </section>

    <section>
      <h2 className="text-sm font-bold text-slate-800 mb-2">4. Armazenamento e Segurança da Informação</h2>
      <p className="leading-relaxed">
        Seus dados são armazenados na infraestrutura do Google Firebase, que adota rigorosos padrões internacionais de segurança cibernética e criptografia (dados em trânsito e em repouso). O MindQuest garante que não comercializa, aluga ou cede seus dados a empresas de publicidade ou terceiros não autorizados.
      </p>
    </section>

    <section>
      <h2 className="text-sm font-bold text-slate-800 mb-2">5. Seus Direitos (LGPD)</h2>
      <p className="mb-2 leading-relaxed">Você possui controle absoluto sobre suas informações. A qualquer momento através do aplicativo, você pode:</p>
      <ul className="list-disc pl-5 space-y-1.5 marker:text-[#E97451]">
        <li><strong className="text-slate-700">Acessar:</strong> Visualizar todo o seu histórico no painel de Análises de Humor.</li>
        <li><strong className="text-slate-700">Retificar:</strong> Alterar seus dados cadastrais, e-mail, senha e preferências do questionário de perfil.</li>
        <li><strong className="text-slate-700">Direito ao Esquecimento (Exclusão):</strong> Apagar permanentemente sua conta e varrer todos os seus registros de humor, desabafos e atividades do nosso banco de dados. Esta ação é imediata e irreversível.</li>
      </ul>
    </section>

    <section >
      <h2 className="text-sm font-bold text-slate-800 mb-2">6. Consentimento</h2>
      <p className="mb-2 leading-relaxed">
        Ao criar sua conta e marcar a caixa de seleção na tela de cadastro, você manifesta seu consentimento livre, expresso, informado e inequívoco com estes Termos, autorizando o processamento dos seus dados sensíveis de saúde mental exclusivamente para as finalidades descritas neste documento.
      </p>
    </section>
  </div>
);