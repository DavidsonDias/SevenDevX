/** Permission prompts can remain unanswered; never leave activation busy indefinitely. */
export async function pushTimeout<T>(
  task: Promise<T>,
  milliseconds: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      task,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
}

/** Background timers are throttled; countdowns must follow elapsed wall-clock time. */
export function pushCooldownSeconds(deadline:number,now=Date.now()){return Math.max(0,Math.ceil((deadline-now)/1000));}
