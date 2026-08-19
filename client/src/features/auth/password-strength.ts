import type { ZxcvbnFactory, ZxcvbnResult } from '@zxcvbn-ts/core';

let estimatorPromise: Promise<ZxcvbnFactory> | undefined;

const configureZxcvbn = () => {
  estimatorPromise ??= Promise.all([
    import('@zxcvbn-ts/core'),
    import('@zxcvbn-ts/language-common'),
    import('@zxcvbn-ts/language-en'),
  ]).then(([core, common, english]) => {
    return new core.ZxcvbnFactory({
      dictionary: {
        ...common.dictionary,
        ...english.dictionary,
      },
      graphs: common.adjacencyGraphs,
      translations: english.translations,
    });
  });

  return estimatorPromise;
};

export const estimatePasswordStrength = async (password: string, username: string): Promise<ZxcvbnResult> => {
  const estimator = await configureZxcvbn();
  const userInputs = username.trim() ? [username.trim()] : [];

  return estimator.check(password, userInputs);
};
