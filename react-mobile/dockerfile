FROM  node 
ADD . /app/
EXPOSE 3000
WORKDIR /app
RUN cd ./server
RUN npm install 
RUN cd ../
CMD ["node","./server/index.js"]
