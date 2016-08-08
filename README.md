# MongoBridge Webtask

MongoBridge is a demo WebTask which connects to a MongoDB server and exposes methods to query the database. It provides an easy a convenient syntax to query the database. A javascript client can be found too.

MongoBridge aids during the creation of SPA by separating all database access to a webtask.

### MongoDB and WebTask setup
In every new deployment you need to create a new collection named mongoBridgeSettings

```js
db.createCollection('mongoBridgeSettings')
```
Once the collection is created you can setup rights to your collections as specified in the Security section.

You need to provide the MongoDB connection url to the webtask. You can do so by

### Security
MongoBridge has a basic rights control over collections. Every collections exposed by MongoBridge have different access methods available.

The easyest way to modify permissions on a collection is using the MongoBridgeClient:

```js
MongoBridgeClient.allow('users', ['find', 'findOne', 'insert'])
```   
The previous command will grant permissions to execute the methods find, findOne and insert on the users collection.

```js
MongoBridgeClient.deny('users', ['remove', 'insert'])
```   
The previous command will remove permissions to execute the methods remove and insert on the users collection.

### Supported functionality
Currently MongoBridge supports only operations on collections. The following methods are currently supported by MongoBridge:

- find
- findeOne
- insert
- update
- remove

All the native Node.js MongoDB methods which return a cursor are automatically returning an array in MongoBridge. Cursors functionality (as skip, limit, max, etc) is not yet supported but it is easy to add in to the WebTask by providing another object in the POST request indicating the vector operations.

### MongoBridgeClient
The MongoBridgeClient is a simple javascript library which allows to query MongoDB in the browser in a similar way as you do on the native MongoDB Node.js native driver. You can find the code here.

The first step is to initialize the client in this way:
```js
MongoBridgeClient.initialize('http://localhost:3000');
```   
After this you can start querying your database as usual:
```js
 MongoBridgeClient.collection("users").find({
   age: {"$gte": 25}
 });


 MongoBridgeClient.collection("users").insert({
   name: "John",
   lastName: "Brown",
   email: "johnBrown@nodomain.com",
   age: 31
 });

 MongoBridgeClient.collection("users").update({
   _id: "57a73936d14cfe8bfa8849ff57a73936d14cfe8bfa8849ff"
 }, {
   $set: {
     email: "johnBrown@differentdomain.com"
   }
 });

 MongoBridgeClient.collection("users").remove({
   email: "johnBrown@nodomain.com"
 });
```
### WebTask request query syntax
The MongoBridge Webtask demo has been designed to provide a syntax as close as possible to the Node.js MongoDB driver.

You can query MongoBridge with a similar syntax to the one from the native client. The main difference is that the parameters are set in an array on the post request.

The ajax request to query the mongo would look like this:

```js
 $.ajax({
   url: mongoBridgeWebApiUrl + '/query',
   method: 'POST',
   contentType: 'application/json',
   data: JSON.stringify({ params: queryParameters })
 });
```

Where the queryParameters have the following shape:

Node.js MongoDB driver
db.collection("users").find({name: "Jack", lastName: "the Ripper"})
MongoBridge POST query parameters
["users", "find", {name: "Jack", lastName: "the Ripper"}]
Projections or other options are supported as well:

>Node.js MongoDB driver
```js
db.collection("users").find(
{name: "Jack", lastName: "the Ripper"},
 {victims: 1, nationality: 1})
```
> MongoBridge POST query parameters
```js
["users", "find",
   {name: "Jack", lastName: "the Ripper"},
   {victims: 1, nationality: 1}]
```
### Future improvements
The next features to be included are:
MongoDB cursors functionality
