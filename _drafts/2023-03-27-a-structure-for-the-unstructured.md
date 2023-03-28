---
layout: page
title:  "A structure for the unstructured. A different take on Clean Architecture for domain centric applications"
date:   2023-03-27
description:  "A structure for the unstructured. A different take on Clean Architecture for domain centric applications"
tags:
    - Domain Driven Design
    - Clean Architecture
---

The motivation behind writing this article is the desire to share my personal observations on running multiple Domain Driven
projects in the last several years. There has been a lot of fuss lately on Twitter regarding the topic of Clean Architecture, so I decided that perhaps right now a good time to share what I believe in these days.

I have been pursuing a **path to find a structure** of the application that works for most teams and provides maximum ergonomy within the lifecycle of the project. 
I am also guilty of following the mainstream Clean Architecture with four main layers for several years blindly and I have seen the negative effects of the typical approach, which were hard to recover from. 

The goal of the article is to provide an alternative structure based on Clean and Onion Architecture that has proven beneficial for the teams I have been part of. 
Sometimes to see clearly, we need to liberate ourselves from dogmas and "best practices" of the industry. 

## Promise of Clean Architecture

Clean Architecture is a software architecture approach that emphasizes the separation of concerns in a system and focuses on creating loosely coupled, independent components. You organize your codebase in four main layers: Domain, Application, Infrastructure and User Interface. The layers follow a set of strict rules, like Domain can’t rely on Application and User Interface layers. 

The main intention is to **focus on the Domain** layer itself, which represents the real-world 
concepts, behaviors, structures and rules that the system models. From the Domain layer we thread up and maintain the clean separation of concerns. The idea itself is great and it's definitely a step from any architecture that entangles all the concerns together (I’m looking at you the descendants of the MVC). 

Unfortunately when the project and the domain scope grows, the layers do not live up to save us in the long run, as they do not provide powerful enough structure to keep us organized, nor they prevent us from entangling all concepts within the layer itself. We need a more principled approach that would guide us into creating a long lasting, ergonomic structure.

## Focus on the Domain and the entanglement inside single layer

Several highly starred templates on Github for Clean Architecture reveal the initial structure as follows:

```bash
├───Domain
│   ├───Common
│   ├───Entities
│   ├───Enums
│   ├───Events
│   ├───Exceptions
│   └───ValueObjects
├───Application
├───Infrastructure
├───UserInterface
```

Having a clean separation of our Domain layer is a great treat, but do we really know what is going on exactly? Do we know what sort of project it is? Does it handle invoices, file management, scheduling? In order for us to know, we would have to traverse between folders inside the Domain project, glue the representation of the problem space in our head and then we are able to come to conclusions. The structure is definitely  **not domain revealing**.


On top of that, what happens if our project has a set or problem spaces that we may want to keep separated? Would we pour all concepts together inside `Entities`, `ValueObjects` and more? **Keeping a single layer of separation for all connected, semi-connected or disjoint problem spaces can lead up to the Domain Spaghetti** itself. All concepts will be separated by a technical layer, which should provide some degree of separation, but what stops us from entanglement of all concepts like Shipments, Scheduling, Simulations, Audit Log, File Management and more together and dependent on each other? 

The concept of **Bounded Contexts** is something that can partially help us to solve the problem and we'll cover that in the following section.

## Models arise

As the application scope grows, the multitude of models will definitely arise and maintaining healthy connections between different models can be a challenging task. The deeper we go, the more confusing the scope of the single model itself can become, as one model is deemed to have different meaning, depending on who is looking and interacting with it. 

```
"Multiple models are in plan on any large project. Yet when code based on distinct models is combined, software becomes buggy, unreliable, and difficult to understand. Communication among team members becomes confused. It is often unclear in what context a model should not be applied." 

> Eric Evans, Domain Driven Design - Tacking Complexity in the Heart of Software
```

Without providing a set of boundaries around our models, the structure of the project can lead to something as follows (Domain Spaghetti mentioned earier):

``` bash
├───Entities
|   ├───Deliveries
|   |       Delivery.cs
|   |       Tracking.cs
|   |   Attachment.cs
│   |   Shipment.cs
│   |   User.cs
│   |   Order.cs
│   |   Quote.cs
|   |   Invoice.cs
├───Repositories
|       IShimentRepository.cs
|       IUserRepository.cs
|       IOrderRepository.cs
|       IDeliveryRepository.cs
```

The structures similar to the listing above I have found throughout many years of developing software. They can also be found in most of the sample projects on Github. On a smaller scale it usually works fine, but as more and more models need to interact with each other in different contexts, the lack of separation in the scope of single logical boundary can lead to confusion in the long run.


The set of boundaries around models is known as **Bounded Context** separation.
It defines the scope of the model and separates different areas of the domain into smaller parts, each with its own language, concepts, and rules. Bounded contexts help manage the complexity of the domain, ensuring the model accurately represents the business requirements and is cohesive and consistent. It is worth mentioning that having a set of boundaries is useful not only for business domains, but for any technical and functional domains as well.


In order to have a visible line that separates given set of models, we need a **physical separation** of those contexts. Physical separation can be a `namespace, folder, package`, depending on the language we are operating within.


Having a physical separation makes us more principled in the way we structure modules and communications between modules itself. The approach to structuring applications called **Modular Monolith** takes that premise and enforces the physical separations of business concerns. This is a great step towards more maintainable software.


The given example from open source project looks as follows:


```bash
├── Administration
│   ├── Application
│   ├── Domain
│   ├── Infrastructure
│   ├── IntegrationEvents
│   └── Tests
├── Meetings
│   ├── Application
│   ├── Domain
│   ├── Infrastructure
│   ├── IntegrationEvents
│   └── Tests
├── Payments
│   ├── Application
│   ├── Domain
│   ├── Infrastructure
│   ├── IntegrationEvents
│   └── Tests
└── UserAccess
    ├── Application
    ├── Domain
    ├── Infrastructure
    ├── IntegrationEvents
    └── Tests
```

The structure itself is definitely more intent revealing. We can see clearly all modules 
of the application defined by its physical boundaries. Inside the module itself the approach still favors layered architecture, but in this example the scope of layers is closed, making it much easier to maintain the project in the long run.

It's definitely a step in the right direction.

## Upstream/downstream connected components