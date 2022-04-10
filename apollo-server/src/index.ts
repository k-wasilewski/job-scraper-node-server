import { Server } from 'http';

import startServer from './server';

try {
  const PORT = 8080;

  let server: Server;

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(data => {
      if (server) {
        server.close();
      }
      data.hotReloaded = true;
    });
    module.hot.addStatusHandler(status => {
      if (status === 'fail') {
        process.exit(250);
      }
    });
  }

  const firstStartInDevMode =
    module.hot && process.env.LAST_EXIT_CODE === '0' && (!module.hot.data || !module.hot.data.hotReloaded);

  startServer(PORT).then(serverInstance => {
    if (!module.hot || firstStartInDevMode) {
      console.log(`GraphQL Server is now running on http://localhost:${PORT}`);
    }

    /*scrape(
        'https://www.nofluffjobs.com',
        '/jobs/remote/fullstack?criteria=city%3Dwarszawa%20%20requirement%3Djava,react&page={}',
        'a[class*="posting-list-item"]',
        'job',
        2,
    );
    scrape(
        'https://bulldogjob.pl',
        '/companies/jobs/s/city,Remote,Warszawa/role,fullstack/skills,Java,JavaScript/page.{}',
        'a[class*="absolute top-0 left-0 w-full h-full"]',
        'jobs',
        1
    )
    scrape(
        'https://justjoin.it',
        '/remote-poland/javascript',
        'a[class*="jss"]',
        'offers',
        1
    )
    scrape(
        'https://justjoin.it',
        '/remote-poland/java',
        'a[class*="jss"]',
        'offers',
        1
    )
    scrape(
        'https://justjoin.it',
        '/remote-poland/javascript',
        'a[class*="jss"]',
        'offers',
        1
    )
    scrape(
        'https://it.pracuj.pl',
        '/?wp=Warszawa&tt=React.js&s=fullstack&rw=true',
        'a[data-test="offer-link"]',
        'praca',
        1
    )
    scrape(
        'https://it.pracuj.pl',
        '/?wp=Warszawa&tt=Java&s=fullstack&rw=true',
        'a[data-test="offer-link"]',
        'praca',
        1
    )*/

    server = serverInstance;
  });
} catch (e) {
  console.error(e);
  process.exit(1);
}
