# Task Manager Web Application

A simple, responsive task management application built with vanilla JavaScript, HTML, and CSS. This application provides basic CRUD (Create, Read, Update, Delete) operations for managing tasks.

## Features

- Create new tasks with title and description
- View all tasks in a clean, responsive interface
- Edit existing tasks
- Delete tasks
- Persistent storage using localStorage
- Responsive design that works on all devices
- XSS protection
- Modern UI with smooth animations

## Deployment

This application is static and can be deployed to any web hosting platform. Here are some popular options:

### GitHub Pages
1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to Settings > Pages
4. Select your main branch as the source
5. Your site will be published at `https://[username].github.io/[repository]`

### Netlify
1. Sign up for a Netlify account
2. Drag and drop your project folder to Netlify's upload area
3. Your site will be automatically deployed with a Netlify subdomain

### Vercel
1. Sign up for a Vercel account
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in your project directory
4. Follow the prompts to deploy

## Local Development

1. Clone this repository
2. Open `index.html` in your browser
3. Start adding, editing, and managing tasks

No build process or dependencies required!

## File Structure

```
/
├── index.html      # Main HTML file
├── styles.css      # CSS styles
├── app.js         # JavaScript functionality
└── README.md      # Documentation
```

## Security

- All user input is escaped to prevent XSS attacks
- No external dependencies required
- Data is stored locally in the user's browser

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this code for any purpose. "# connect" 
