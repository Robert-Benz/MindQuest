export const mapearErroFirebase = (codigoErro) => {
  switch (codigoErro) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email ou senha incorretos. Verifique seus dados e tente novamente.';
    case 'auth/email-already-in-use':
      return 'Esse email já está cadastrado em outra conta.';
    case 'auth/weak-password':
      return 'Sua senha é muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'O formato do email é inválido.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet.';
    default:
      return 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.';
  }
};