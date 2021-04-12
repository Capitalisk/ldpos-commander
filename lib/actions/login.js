const login = async () => {
  const passphrase = await cli.promptInput('Passphrase:', true);

  if (!passphrase) throw new Error('No passphrase provided.');

  try {
    await client.connect({
      passphrase,
    });
    authenticated = true;
  } catch (e) {
    cli.errorLog(e.message);
  }
};

module.exports = { login };
