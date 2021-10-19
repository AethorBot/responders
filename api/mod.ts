import { listenAndServe } from 'https://deno.land/std@0.111.0/http/server.ts';
import { parse } from 'https://deno.land/std@0.112.0/encoding/toml.ts';
async function handleRequest(request: Request) {
	const { pathname, search } = new URL(request.url);
	const params = new URLSearchParams(search);

	if (pathname.startsWith('/responders')) {
		const server = params.get('server');
		if (server) {
			try {
				const data = await Deno.readTextFile(
					`${Deno.cwd()}/data/${server}.toml`
				);
				const toml = parse(data);
				return new Response(JSON.stringify(toml.responder), {
					headers: {
						'content-type': 'application/json',
					},
				});
			} catch (e) {
				return new Response(JSON.stringify({ success: false, message: e }), {
					headers: {
						'content-type': 'application/json',
					},
				});
			}
		}
	} else if (pathname.startsWith('/all')) {
		const files = Deno.readDir(`${Deno.cwd()}/data`);

		const data: Record<string, unknown> = {};
		for await (const file of files) {
			try {
				const content = await Deno.readTextFile(
					`${Deno.cwd()}/data/${file.name}`
				);

				data[file.name.split('.')[0] as string] = parse(content).responder;
			} catch (e) {
				console.log(e);
			}
		}
		return new Response(JSON.stringify(data), {
			headers: {
				'content-type': 'application/json',
			},
		});
	}
	return new Response(JSON.stringify({}, null, 2), {
		headers: {
			'content-type': 'application/json',
		},
	});
}

console.log('Listening on http://localhost:8080');
await listenAndServe(':8080', handleRequest);
