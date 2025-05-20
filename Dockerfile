FROM nginx:alpine

COPY . /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

# Configure Nginx to use setup.html as the default page
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index setup.html; \
        try_files $uri $uri/ /setup.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 