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


