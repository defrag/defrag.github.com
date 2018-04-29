---
layout: page
title:  "Functional testing ASP.NET Core API applications with NMatcher"
date:   2018-04-29
description: "Functional testing ASP.NET Core API applications with NMatcher"
tags:
    - Api
    - ASP.NET
    - Testing
    - NMatcher
---

This post aims to show alternative approach to functional API testing. ASP.NET Core ships with great 
`TestServer` class, which tremendously eases any kind of functional and integration testing on the platform. 
Most of the examples of testing APIs you'll find follows one of the two approaches: either unit testing controller or 
using `TestServer`, where we create HTTP request, send it over and assert the response. 

Lets go throught each of them and see what they offer.

## Unit testing controllers

The example is very straightforward and there isn't much to talk about here. 
We set up our test subject with a mocked repository, call the actual method on a controller 
and assert the view model returned from our invocation.

```csharp
[Fact]
public async Task it_returnes_the_list_of_venues_when_calling_index_method()
{
    // Arrange
    var mockRepo = new Mock<IVenueRepository>();
    mockRepo.Setup(repo => repo.ListAsync()).Returns(Task.FromResult(GetVenueTestFixtures()));
    var controller = new VenueController(mockRepo.Object);

    // Act
    var result = await controller.Index();

    // Assert
    var viewResult = Assert.IsType<ViewResult>(result);
    var model = Assert.IsAssignableFrom<IEnumerable<VenueViewModel>>(
        viewResult.ViewData.Model);
    Assert.Equal(10, model.Count());
}
 ```

In my personal opinion, there isn't much too gain from this kind of testing. Controller usually
sits at one of the highest layers, the User Interface Layer. The further we go up through the layers
from Domain up to the User Interface, the value of pure unit tests itself diminishes. The test like above
gives us no confidence that our application works at all. We don't check if our dependencies are wired up properly,
if the request was being translated properly, nor if the response was send to the end user properly. We don't even
check which fields we exposed as part of the public API and which we didn't.

In light of those observations, the second approach seems much more reasonable.

## Integration testing using TestServer

Lets see how our examples with venues will look up using the `TestServer`.

```csharp
public class VenueControllerIntegrationTest
{
    private readonly TestServer _server;
    private readonly HttpClient _client;
    private readonly TestState _state;

    public VenueControllerIntegrationTest()
    {
        _server = new TestServer(new WebHostBuilder()
            .ConfigureServices(services => {
                services.AddSingleton<TestState>();
            })
            .UseStartup<Startup>());
        _client = _server.CreateClient();
        _state = _server.Host.Services.GetService<TestState>();
    }

    [Fact]
    public async Task test_listing_of_venues()
    {
        // Arrange
        _state.VenueExists(Guid.NewGuid(), ".NET meetup Manhattan", "Broadway St.");
        _state.VenueExists(Guid.NewGuid(), ".NET meetup Cracov", "Florianska");

        // Act
        var response = await _client.GetAsync("/");
        response.EnsureSuccessStatusCode();

        var responseString = await response.Content.ReadAsStringAsync();

        // Assert
        var venues = JsonConvert.DeserializeObject<IEnumerable<VenueViewModel>>(responseString);
        venues.Count().Should().Be(2);
    }
}
```

This high level test already gives us more confidence, as we make sure the dependencies were wired
up properly during runtime, our request was translated by the server and the response was successful.

We're left with small issue. Does this test really serve as great documentation? Assert phase only checks if the value was deserialized properly into view model.
If we would like to figure out the actual response, we would have to drill down into view model and figure out how
its being serialized for the response and fit the pieces together in our head. 

This is where the [NMatcher](https://github.com/defrag/NMatcher) library comes in place. It allows us to assert JSON/XML responses without caring about 
certain pieces of the response. Lets rework our test case in the next section while expanding our case with additional one for creation of the venue.

## Functional testing using TestServer and NMatcher

We can use NMatcher to assert the proper JSON and leave out any application specific details when testing
our path from `Request` to `Response`. This make our test fully functional, as we take the raw input and assert the
raw output. This way we make sure every piece of code responsible for manipulating the HTTP pipeline was hit, all request translation was done properly and the response output is what we expect. It also serves as a great documentation for any developer that wants to use our API (and for ourselves as well).

```csharp
[Fact]
public async Task test_listing_of_venues()
{
    // Arrange
    _state.VenueExists(Guid.NewGuid(), ".NET meetup Manhattan", "NY, Broadway St.");
    _state.VenueExists(Guid.NewGuid(), ".NET conference", "Cracov, Florianska");

    // Act
    var response = await _client.GetAsync("/");
    response.EnsureSuccessStatusCode();

    // Assert
    var responseBody = await response.Content.ReadAsStringAsync();
    responseBody.Should().MatchJson(@"[
        {
            ""VenueId"":""@guid@"",
            ""Name"":"".NET meetup Manhattan"",
            ""Address"":""NY, Broadway St."",
            ""CreatedAt"": ""@string@.IsDateTime()""
        },
        {
            ""VenueId"":""@guid@"",
            ""Name"":"".NET conference"",
            ""Address"": ""Cracov, Florianska"",
            ""CreatedAt"": ""@string@.IsDateTime()""
        }
    ]");
}

[Fact]
public async Task test_creation_of_venues()
{
    var payload = @"
        {
            ""Name"": "".NET meetup Manhattan"",
            ""Address"": ""Florianska 1"",
            ""Seats"": ""10"",
            ""DiscountCoupons"": [
                {""CouponCode"": ""PC0001"", ""ProductName"": ""Awesome PC"" },
                {""CouponCode"": ""PC0002"", ""ProductName"": ""Awesome PC #2"" }
            ]
        }
    ";
    var response = await af.PostJson("api/venues", payload);
    response.StatusCode.Should().Be(HttpStatusCode.Created);

    var responseBody = await response.Content.ReadAsStringAsync();

    responseBody.Should().MatchJson(@"
        {
            ""VenueId"":""@guid@"",
            ""Name"":"".NET meetup Manhattan"",
            ""Address"":""NY, Broadway St."",
            ""CreatedAt"": ""@string@.IsDateTime()""
        }
    ");
    
}

```

As we can see, in order to make our testing easier, we introduced the notion of `matchers`, which serves as a
container for values that we cannot predict. Those values can be guids, auto increment ids, dates, times etc. 

Check out the NMatcher [github page](https://github.com/defrag/NMatcher) for full documentation and what it can do for You.
Play around with the alternative approach to testing APIs with ASP.NET Core and perhaps it will fit your needs, as it fit mine.