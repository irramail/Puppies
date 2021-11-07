package controllers

import javax.inject._

import play.api.mvc._
import play.api.i18n._
import models.PuppyTreeDatabaseModel
import models.UserData
import play.api.libs.json._
import models._

import play.api.db.slick.DatabaseConfigProvider
import scala.concurrent.ExecutionContext
import play.api.db.slick.HasDatabaseConfigProvider
import slick.jdbc.JdbcProfile
import slick.jdbc.PostgresProfile.api._
import scala.concurrent.Future

@Singleton
class PuppyTree @Inject() (
    protected val dbConfigProvider: DatabaseConfigProvider,
    cc: ControllerComponents
)(implicit ec: ExecutionContext)
    extends AbstractController(cc)
    with HasDatabaseConfigProvider[JdbcProfile] {

  private val model = new PuppyTreeDatabaseModel(db)

  def load = Action { implicit request =>
    Ok(views.html.versionMain())
  }

  implicit val userDataReads = Json.reads[UserData]
  implicit val puppyItemWrites = Json.writes[PuppyItem]

  def withJsonBody[A](
      f: A => Future[Result]
  )(implicit request: Request[AnyContent], reads: Reads[A]): Future[Result] = {
    request.body.asJson
      .map { body =>
        Json.fromJson[A](body) match {
          case JsSuccess(a, path) => f(a)
          case e @ JsError(_) =>
            Future.successful(Redirect(routes.PuppyTree.load))
        }
      }
      .getOrElse(Future.successful(Redirect(routes.PuppyTree.load)))
  }

  def withSessionUsername(
      f: String => Future[Result]
  )(implicit request: Request[AnyContent]): Future[Result] = {
    request.session
      .get("username")
      .map(f)
      .getOrElse(Future.successful(Ok(Json.toJson(Seq.empty[String]))))
  }

  def withSessionUserid(
      f: Int => Future[Result]
  )(implicit request: Request[AnyContent]): Future[Result] = {
    request.session
      .get("userid")
      .map(userid => f(userid.toInt))
      .getOrElse(Future.successful(Ok(Json.toJson(Seq.empty[String]))))
  }

  def validate = Action.async { implicit request =>
    withJsonBody[UserData] { ud =>
      model.validateUser(ud.username, ud.password).map { ouserId =>
        ouserId match {
          case Some(userid) =>
            Ok(Json.toJson(true))
              .withSession(
                "username" -> ud.username,
                "userid" -> userid.toString,
                "csrfToken" -> play.filters.csrf.CSRF.getToken
                  .map(_.value)
                  .getOrElse("")
              )
          case None =>
            Ok(Json.toJson(false))
        }
      }
    }
  }

  def createUser = Action.async { implicit request =>
    withJsonBody[UserData] { ud =>
      model.createUser(ud.username, ud.password).map { ouserId =>
        ouserId match {
          case Some(userid) =>
            Ok(Json.toJson(true))
              .withSession(
                "username" -> ud.username,
                "userid" -> userid.toString,
                "csrfToken" -> play.filters.csrf.CSRF.getToken
                  .map(_.value)
                  .getOrElse("")
              )
          case None =>
            Ok(Json.toJson(false))
        }
      }
    }
  }

  def puppyTree = Action.async { implicit request =>
    withSessionUsername { username =>
      println("!!! Getting puppies")
      model.getPuppies(username).map(puppies => Ok(Json.toJson(puppies)))
    }
  }

  def addPuppy = Action.async { implicit request =>
    withSessionUserid { userid =>
      withJsonBody[String] { task =>
        model.addPuppy(userid, task).map(count => Ok(Json.toJson(count > 0)))
      }
    }
  }

  def delete = Action.async { implicit request =>
    withSessionUsername { username =>
      withJsonBody[Int] { itemId =>
        model.removePuppy(itemId).map(removed => Ok(Json.toJson(removed)))
      }
    }
  }

  def logout = Action { implicit request =>
    Ok(Json.toJson(true)).withSession(request.session - "username")
  }
}
