// 1. CONFIGURAÇÃO - Substitua a KEY abaixo pela chave 'anon' 'public' (a que começa com eyJ)
const SUPABASE_URL = 'https://wijpbonbzngdglkeqvjy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpanBib25iem5nZGdsa2Vxdmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDQ1MzUsImV4cCI6MjA5MjE4MDUzNX0.FeIP_il0g4mvijP0kVGqsXRZ3dpGq8CGU9bfJNWwENQ'; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// === TODAS AS 11 QUESTÕES ===
const questions = [
    { q: "A tríade CID é a base da segurança. O que garante que um dado esteja acessível sempre que necessário?", options: ["Confidencialidade", "Integridade", "Disponibilidade", "Accountability"], correct: 2 },
    
    { q: "Se um funcionário altera um relatório financeiro sem autorização, qual pilar foi violado?", options: ["Disponibilidade", "Integridade", "Confidencialidade", "Autenticidade"], correct: 1 },
    
    { q: "Por que o Win + L é fundamental para a 'Accountability'?", options: ["Melhora a performance do PC", "Garante que toda ação no seu perfil seja atribuída a você", "Evita que o monitor queime", "Limpa a memória RAM"], correct: 1 },
    
    { q: "Sobre a 'Política de Mesa Limpa', qual alternativa é INCORRETA?", options: ["Senhas não devem ser anotadas", "Documentos devem ser retirados da impressora", "Pode deixar notas fiscais na mesa se for almoçar rápido", "Pendrives desconhecidos são proibidos"], correct: 2 },
    
    { q: "De acordo com o Padrão NIST, o que torna uma senha mais segura?", options: ["Trocar a cada 15 dias", "O comprimento da senha (Passphrases/Frases longas)", "Usar nome do pet + 123", "Usar apenas maiúsculas"], correct: 1 },
    
    { q: "Onde o colaborador deve salvar arquivos para garantir backup e recuperação?", options: ["Área de Trabalho (Desktop)", "Documentos local", "Exclusivamente SharePoint ou OneDrive", "Pendrive pessoal"], correct: 2 },
    
    { q: "O que caracteriza a prática de 'Shadow IT'?", options: ["Uso de softwares não homologados pela TI", "Apagar as luzes do escritório", "Usar modo escuro no Windows", "Backup noturno"], correct: 0 },
    
    { q: "Antes de usar um site externo para converter um PDF da empresa, o que deve fazer?", options: ["Validar previamente com a TI", "Usar aba anônima", "Usar e-mail pessoal", "Fazer apenas se for urgente"], correct: 0 },
    
    { q: "Qual a forma correta de verificar um remetente oficial da Usaflex no Outlook?", options: ["Verificar se o nome parece real", "Conferir se o e-mail termina em @usaflex.com.br", "Clicar no link para testar", "Responder perguntando"], correct: 1 },
    
    { q: "Qual o nome do software malicioso que sequestra dados via criptografia e exige resgate?", options: ["Phishing", "MFA Fatigue", "Ransomware", "Shadow IT"], correct: 2 },
    
    { q: "Um colega pede para pular um processo porque está 'travando a operação'. O que fazer?", options: ["Ignorar", "Desconfiar e seguir o protocolo", "Executar e ver o que acontece", "Resolver sozinho"], correct: 1 }
];

let currentIndex = 0;
let answers = [];
let deviceID = "";

async function init() {
    getOrSetDeviceID();
    renderQuestion();
    await fetchGlobalStats();
}

function getOrSetDeviceID() {
    deviceID = localStorage.getItem('usaflex_uuid');
    if (!deviceID) {
        deviceID = 'id-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('usaflex_uuid', deviceID);
    }
}

function renderQuestion() {
    const container = document.getElementById('question-area');
    const q = questions[currentIndex];
    
    // Barra de Progresso
    const progressFill = document.getElementById('progress-bar');
    if (progressFill) {
        const progress = (currentIndex / questions.length) * 100;
        progressFill.style.width = `${progress}%`;
    }

    container.innerHTML = `
        <p style="color:#a68966; font-weight:bold; margin-bottom:5px;">Questão ${currentIndex + 1} de ${questions.length}</p>
        <h2>${q.q}</h2>
        <div class="options-group">
            ${q.options.map((opt, i) => `
                <div class="option-card" onclick="selectOpt(${i})">${opt}</div>
            `).join('')}
        </div>
    `;
}

window.selectOpt = (index) => {
    answers[currentIndex] = index;
    const cards = document.querySelectorAll('.option-card');
    cards.forEach(c => c.classList.remove('selected'));
    cards[index].classList.add('selected');
};

document.getElementById('next-btn').addEventListener('click', async () => {
    if (answers[currentIndex] === undefined) return alert("Por favor, selecione uma opção!");

    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        await finishQuiz();
    }
});

async function finishQuiz() {
    document.getElementById('progress-bar').style.width = `100%`;
    
    let hits = 0;
    let missedIndices = [];

    questions.forEach((q, i) => {
        if (answers[i] === q.correct) hits++;
        else missedIndices.push(i);
    });

    try {
        const { error } = await supabaseClient.from('questionario_resiliencia').insert([{
            device_id: deviceID,
            acertos: hits,
            erros: questions.length - hits,
            perguntas_erradas: missedIndices
        }]);

        if (error) throw error;

        document.getElementById('quiz-flow').classList.add('hidden');
        document.getElementById('result-area').classList.remove('hidden');
        document.getElementById('user-score-msg').innerText = `Você acertou ${hits} de ${questions.length} questões.`;
        
        await fetchGlobalStats();
    } catch (err) {
        console.error("Erro ao salvar:", err);
        alert("Erro de conexão (401 ou Rede). Verifique se usou a chave 'anon' correta!");
    }
}

async function fetchGlobalStats() {
    try {
        const { data, error } = await supabaseClient.from('questionario_resiliencia').select('*');
        if (error) throw error;
        if (!data || data.length === 0) return;

        const totalUsers = data.length;
        const totalHits = data.reduce((sum, row) => sum + row.acertos, 0);
        const accuracy = ((totalHits / (totalUsers * questions.length)) * 100).toFixed(1);

        document.getElementById('total-participants').innerText = totalUsers;
        document.getElementById('global-accuracy').innerText = accuracy + '%';
        document.getElementById('global-errors').innerText = (100 - accuracy).toFixed(1) + '%';

        let errorFreq = {};
        data.forEach(row => {
            if (row.perguntas_erradas) {
                row.perguntas_erradas.forEach(idx => {
                    errorFreq[idx] = (errorFreq[idx] || 0) + 1;
                });
            }
        });

        const keys = Object.keys(errorFreq);
        if (keys.length > 0) {
            const mostMissedIdx = keys.reduce((a, b) => errorFreq[a] > errorFreq[b] ? a : b);
            document.getElementById('most-missed-text').innerText = `"${questions[mostMissedIdx].q}"`;
        }
    } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
    }
}

init();