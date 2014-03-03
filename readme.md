Modella.js
==========

Modella.js is a data modelling object for JavaScript which is meant to act as an abstraction layer between
a simple ORM like Angular's resources or other wire-call service.  The basic CRUD behaviors default to standard
RESTful post, get, put, delete calls, but some extended methods are included.  Speciallized CRUD calls can be configured
upon object instantiation.

Modella.js is currently in development. Please refer to the list below regarding items that are complete and items
that are still in development:

Modella core

- [X] Basic object instantiation
- [X] Model initialization with a pre-built object
- [X] Model initialization with a record id
- [X] Model initialization with a parent record id
- [X] Model initialization with an array of record ids
- [X] Save functionality on initialized model
- [X] Update functionality on initialized model
- [X] Delete functionality on initialized model
- [X] Inheritable object for model configuration

Modella abstraction layer

- [ ] Model hierarchy abstraction object
- [ ] Depth of model construction parameter and management
- [ ] Model instantiation abstraction layer
- [ ] Service call customization
- [ ] Create, update and delete customization
- [ ] Parent-child relationship configuration

Documentation

- [ ] Core API documentation
- [ ] Abstraction layer documentation