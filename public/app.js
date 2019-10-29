
function makeTable() {
    $("#postbodies").empty();
    $.ajax({
        url: "/api/all",
        method: "GET"
    }).then(function (data) {
        for (let post of data) {
            if (post.saved === false) {
                let newTH = $("<th>");
                let newTR = $("<tr>");
                let saveButton = $("<button>");
                saveButton.text("Save this link!");
                saveButton.attr("postid", post._id);
                saveButton.addClass("save-btn");
                newTH.html("<a href=" + post.link + "><p>" + post.title + "</p></a>");
                newTR.append(newTH);
                newTR.append(saveButton);
                $("#postbodies").append(newTR);
            }
        }
        $(".save-btn").on("click", function (event) {
            event.preventDefault();
            $.ajax({
                url: "/api/" + $(this).attr("postid"),
                method: "POST"
            }).then(function (data) {
                console.log("Moved post with ID " + $(this).attr("postid") + " to saved articles!")
            });
        });
    });
}

$("#scrape-btn").on("click", function(event){
    event.preventDefault();
    $.ajax({
        url: "/scrape",
        method: "GET"
    }).then(function(data){
        makeTable();
    })
})



makeTable();