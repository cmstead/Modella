Modella.js
==========

Modella.js is a data modelling object for JavaScript which is meant to act as an abstraction layer between
a simple ORM like Angular's resources or other wire-call service.  The basic CRUD behaviors default to standard
RESTful post, get, put, delete calls, but some extended methods are included.  Speciallized CRUD calls can be configured
upon object instantiation.

Modella.js is currently in development. Please refer to the list below regarding items that are complete and items
that are still in development:

- [X] Basic object instantiation
- [X] Model initialization with a pre-built object
- [X] Model initialization with a record id
- [X] Model initialization with a parent record id
- [ ] Model initialization with an array of record ids
- [ ] Save functionality on initialized model
- [ ] Update functionality on initialized model
- [ ] Delete functionality on initialized model
- [ ] Inheritable object for model configuration
- [ ] Abstracted initialization through inheritable object
- [ ] API documentation