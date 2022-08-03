export const NavBar = [
  {
    title: 'home_page',
    url: '/home',
    icon: 'home',
  },
  {
    title: 'about_page',
    url: '/about',
    icon: 'info',
    dropdown: [
      {
        title: 'about_movement',
        url: '/about/movement',
        icon: 'info',
      },
      {
        title: 'resources_page',
        url: '/about/resources',
        icon: 'envelope',
      },
      {
        title: 'research_page',
        url: '/about/research',
        icon: 'envelope',
      },
    ],
  },
  {
    title: 'browser_page',
    url: '/browse',
    icon: 'home',
    dropdown: [
      {
        title: 'archive_page',
        url: '/browse/main',
        icon: 'home',
      },
      {
        title: 'gallery_page',
        url: '/browse/gallery',
        icon: 'home',
      },
      {
        title: 'repository_page',
        url: '/browse/repository',
        icon: 'home',
      },
    ],
  },
];
