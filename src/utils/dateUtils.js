// Retorna a segunda-feira da semana da data informada no formato YYYY-MM-DD
export function getSegundaFeira(data = new Date()) {
  const d = new Date(data);
  const diaSemana = d.getDay(); // 0 = Dom, 1 = Seg, ...
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

// Retorna uma string descritiva: ex: "3ª semana de Setembro de 2026"
export function getRotuloSemana(dataString) {
  const [ano, mes, dia] = dataString.split("-").map(Number);
  const d = new Date(ano, mes - 1, dia);
  
  // Estima o número da semana dentro do mês
  const numeroSemanaMes = Math.ceil(dia / 7);
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return `${numeroSemanaMes}ª semana de ${meses[mes - 1]}`;
}